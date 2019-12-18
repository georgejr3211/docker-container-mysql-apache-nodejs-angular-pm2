exports.sp_lista_animais_com_dieta_dia = async (migration, Sequelize) => {
    var user_sp_lista_animais_com_dieta_dia = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_lista_animais_com_dieta_dia`()';
    await migration.sequelize.query(`
        ${user_sp_lista_animais_com_dieta_dia}
        BEGIN

            declare v_dt_dia_atual date;
            declare id_sistema integer;
            declare dia_animal integer;

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
                    (tbe.peso/100) as score_animal,
                    tba.tempo_entre_dosagem as t_feed_animal

                from tb_animais tba
                inner join tb_dietas tbd on tbd.id = tba.tb_dieta_id
                inner join tb_dieta_dias tbdd on tbdd.tb_dietas_id = tba.tb_dieta_id
                inner join tb_escores tbe on tbe.id=tba.escore_id
                inner join tb_animais_movimentacoes tbam on tbam.tb_animal_id=tba.id
                inner join tb_chips tbc on tbc.id=tba.chip

                where tba.ativo = 1
                and tba.excluido=0
                and tba.tb_setor_tipo_id=2
                and tbdd.dia = ((DATEDIFF(v_dt_dia_atual, tbam.dt_inseminacao)+1) )
                and tbam.created = (select MAX(tbam.created) from tb_animais_movimentacoes tbam where tbam.tb_animal_id=tba.id)
                and tbdd.ativo=1
                order by tba.id_rede ASC;

            COMMIT;
        END
        `), console.log('::: SP_LISTA_ANIMAIS_COM_DIETA_DIA')
}
