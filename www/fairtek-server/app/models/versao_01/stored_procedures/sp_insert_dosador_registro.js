exports.sp_insert_dosador_registro = async (migration, Sequelize) => {
    var user_sp_insert_dosador_registro = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_dosador_registro`( IN p_dosador_mac text, IN p_animal_id_rede integer, IN p_qa integer,IN p_data_qa text)';
    await migration.sequelize.query(`
        ${user_sp_insert_dosador_registro}
        BEGIN

            declare v_id_dosador integer;
            declare v_id_baia integer;
            declare v_id_dieta integer;
            declare v_dia_animal integer;
            declare v_dt_dia_registro date;
            declare v_mov_date datetime;
            declare v_mov_id integer;
            declare v_inseminacao_date datetime;
            declare v_id_animal integer;
            declare id_up integer;
            declare v_escore integer;
            declare v_ciclo_animal integer;

            START TRANSACTION;

                set v_dt_dia_registro = DATE(p_data_qa);

                set v_id_dosador = (select tbd.id from tb_dosadores tbd where tbd.codigo = p_dosador_mac);
                set v_id_baia = (select tbb.id from tb_baias tbb inner join tb_dosadores tbd on tbd.tb_baias_id = tbb.id where tbd.id = v_id_dosador);
                set v_id_animal = (select tba.id from tb_animais tba where tba.id_rede = p_animal_id_rede ORDER BY tba.id DESC LIMIT 1);

                set v_id_dieta = (select tbd.id from tb_dietas tbd
                                    inner join tb_animais tba on tba.tb_dieta_id = tbd.id
                                    where tba.id = v_id_animal);

                set v_mov_date=(select MAX(tbam.created) from tb_animais_movimentacoes tbam
                                where tbam.tb_animal_id=v_id_animal);

                set v_mov_id=(select id from tb_animais_movimentacoes where created=v_mov_date and tb_animal_id = v_id_animal);

                set v_inseminacao_date=(select tbam.dt_inseminacao from tb_animais_movimentacoes tbam
                                        where  tbam.id=v_mov_id);


                set v_dia_animal = ((DATEDIFF(v_dt_dia_registro, v_inseminacao_date))+1);

                set v_escore = (select tbe.peso/100 from tb_escores tbe
                                inner join tb_animais tba
                                where tba.id=v_id_animal and tbe.id = tba.escore_id);

                set v_ciclo_animal = (select tba.ciclo_animal from tb_animais tba
                                      where tba.id_rede = p_animal_id_rede ORDER BY tba.id DESC LIMIT 1);

                select
                    tbd.id,
                    tbdd.qtd/100
                into
                    @v_dieta_codigo,
                    @v_dieta_qr_dia
                from tb_dietas tbd
                inner join tb_dieta_dias tbdd on tbdd.tb_dietas_id = tbd.id
                where tbd.id = v_id_dieta
                and tbdd.dia = v_dia_animal
                and tbdd.ativo=1;

                insert into tb_registros
                (
                    tb_baias_id,
                    tb_dosadores_id,
                    tb_animais_id,
                    qa,
                    qa_data,
                    qr_dieta,
                    codigo_dieta,
                    dia_animal,
                    created
                )
                values
                (
                    v_id_baia,
                    v_id_dosador,
                    v_id_animal,
                    p_qa,
                    p_data_qa,
                    @v_dieta_qr_dia,
                    @v_dieta_codigo,
                    v_dia_animal,
                    now()
                );




        IF EXISTS (select tbar.id from tb_animais_registros tbar where tb_animais_id = v_id_animal and dia = v_dia_animal and v_ciclo_animal = tbar.ciclo_animal) THEN
                    set id_up = (select tbar.id as id_up from tb_animais_registros tbar where tb_animais_id = v_id_animal and dia = v_dia_animal and v_ciclo_animal = tbar.ciclo_animal);
                    update tb_animais_registros
                    set
                        dieta_codigo=@v_dieta_codigo,
                        qt=(SELECT qr FROM tb_dieta_dias WHERE tb_dietas_id = @v_dieta_codigo AND dia = v_dia_animal AND ativo = 1 AND excluido = 0)+v_escore,
                        qa=qa+p_qa,
                        updated=now(),
                        dosador_data=v_dt_dia_registro,
                        ult_dosador=v_id_dosador,
                        ciclo_animal=v_ciclo_animal
                    where id=id_up;
                ELSE
                    insert into tb_animais_registros
                    (
                        tb_animais_id,
                        dia,
                        qt,
                        dieta_codigo,
                        qa,
                        created,
                        updated,
                        dosador_data,
                        ult_dosador,
                        ciclo_animal
                    )
                    values
                    (
                        v_id_animal,
                        v_dia_animal,
                        @v_dieta_qr_dia+v_escore,
                        v_id_dieta,
                        p_qa,
                        now(),
                        now(),
                        v_dt_dia_registro,
                        v_id_dosador,
                        v_ciclo_animal
                    );
                END IF;
            COMMIT;
        END
        `), console.log('::: SP_INSERT_DOSADOR_REGISTRO')
}