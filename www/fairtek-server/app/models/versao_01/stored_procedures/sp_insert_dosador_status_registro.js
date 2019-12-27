exports.sp_insert_dosador_status_registro = async (migration, Sequelize) => {
    var user_sp_insert_dosador_status_registro = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_dosador_status_registro`(p_dosador_mac varchar(45), p_status_racao integer, p_status_antena integer, p_status_motor integer, p_status_dosador integer, p_status_memoria integer, p_status_rede integer)';
    await migration.sequelize.query(`
        ${user_sp_insert_dosador_status_registro}
        BEGIN

            declare v_id_dosador integer;
            declare v_id_baia integer;

            START TRANSACTION;

                set v_id_dosador = (select tbd.id from tb_dosadores tbd where tbd.codigo = p_dosador_mac);
                set v_id_baia = (select tbb.id from tb_baias tbb inner join tb_dosadores tbd on tbd.tb_baias_id = tbb.id where tbd.id = v_id_dosador);

                select
                    tbd.status_racao,
                    tbd.status_antena,
                    tbd.status_motor,
                    tbd.status_dosador,
                    tbd.status_memoria,
                    tbd.status_rede
                into
                    @v_status_racao,
                    @v_status_antena,
                    @v_status_motor,
                    @v_status_dosador,
                    @v_status_memoria,
                    @v_status_rede
                from tb_dosadores tbd
                where tbd.id = v_id_dosador;

                if (p_status_racao <> @v_status_racao or
                    p_status_antena <> @v_status_antena or
                    p_status_motor <> @v_status_motor or
                    p_status_dosador <> @v_status_dosador or
                    p_status_memoria <> @v_status_memoria or
                    p_status_rede <> @v_status_rede) then

                    update tb_dosadores
                    set
                        status_racao = p_status_racao,
                        status_antena = p_status_antena,
                        status_motor = p_status_motor,
                        status_dosador = p_status_dosador,
                        status_memoria = p_status_memoria,
                        status_rede = p_status_rede,
                        updated=now()
                    where id = v_id_dosador;

                    insert into tb_registros_status_dosador
                    (
                        tb_dosadores_id,
                        tb_baias_id,
                        status_racao,
                        status_antena,
                        status_motor,
                        status_dosador,
                        status_memoria,
                        status_rede,
                        created
                    )
                    values
                    (
                        v_id_dosador,
                        v_id_baia,
                        p_status_racao,
                        p_status_antena,
                        p_status_motor,
                        p_status_dosador,
                        p_status_memoria,
                        p_status_rede,
                        now()
                    );
                else
                    update tb_dosadores
                    set
                        updated=now()
                    where id = v_id_dosador;
                end if;

            COMMIT;
        END
        `), console.log('::: SP_INSERT_DOSADOR_STATUS_REGISTRO')

}