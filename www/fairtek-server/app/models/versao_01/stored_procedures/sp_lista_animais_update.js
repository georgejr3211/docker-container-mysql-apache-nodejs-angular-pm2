exports.sp_lista_animais_update = async (migration, Sequelize) => {
    var user_sp_lista_animais_update = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_lista_animais_update`()';
    await migration.sequelize.query(`
    ${user_sp_lista_animais_update}
    BEGIN

        declare v_dt_dia_atual date;

        START TRANSACTION;

            set v_dt_dia_atual = DATE(NOW());

            select
                tba.id as id_sistema,
                tba.id_rede as id_animal,
                tbc.chip as rfid_animal,
                DATEDIFF(v_dt_dia_atual, tbam.dt_inseminacao)+1 as dia_animal,
                if((DATE(tbam.dt_movimentacao)=DATE(NOW())),
                0,(tbdd.qtd/100 + tbe.peso/100)) as qr,
                tbd.id_rede as id_dieta,
                (tba.excluido=1 || tba.tb_setor_tipo_id<>2) as excluido_animal,
                tba.tb_setor_tipo_id<>2 as ativo_animal,
                (tbe.peso/100) as score_animal,
                tba.tempo_entre_dosagem as t_feed_animal

            from tb_animais tba
            inner join tb_dietas tbd on tbd.id = tba.tb_dieta_id
            inner join tb_dieta_dias tbdd on tbdd.tb_dietas_id = tba.tb_dieta_id
            inner join tb_escores tbe on tbe.id=tba.escore_id
            inner join tb_animais_movimentacoes tbam on tbam.tb_animal_id=tba.id
            inner join tb_chips tbc on tbc.id=tba.chip

            where  tba.ag_update = 1
            /*and tba.tb_setor_tipo_id=2 /*Animal está na gestação*/
            /*****ORIGINAL GDUO
            and tbdd.dia = ((DATEDIFF(v_dt_dia_atual, tbam.dt_inseminacao)+1) )
            and tbam.created = (select MAX(tbam.created) from tb_animais_movimentacoes tbam where tbam.tb_animal_id=tba.id)
            and tbdd.ativo=1
            order by tba.id_rede ASC;**/
        
            /***CORRECAO fairtek2 ****/
            and ((tbdd.dia = ((DATEDIFF(DATE(NOW()), tbam.dt_inseminacao)+1))
            and tbam.created = (select MAX(tbam.created) from tb_animais_movimentacoes tbam where tbam.tb_animal_id=tba.id)
            OR  tbam.created = (select MAX(tbam.created) from tb_animais_movimentacoes tbam where tbam.tb_animal_id=tba.id)))
            and tbdd.ativo=1
            GROUP BY id_sistema
            order by tba.id_rede ASC;

        COMMIT;
    END
    `), console.log('::: SP_LISTA_ANIMAIS_UPDATE')
}