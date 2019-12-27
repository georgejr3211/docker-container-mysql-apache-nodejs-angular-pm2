exports.sp_select_notificacao_agente = async (migration, Sequelize) => {
    var user_sp_select_notificacao_agente = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_select_notificacao_agente`()';
    await migration.sequelize.query(`
    ${user_sp_select_notificacao_agente}
    BEGIN

        declare v_id bigint;

        START TRANSACTION;

            set v_id = (select id from tb_notificacoes where tb_notificacoes_tipos_id in (1,3,6,8,10,12,14) and lida = 0 limit 1);

            update tb_notificacoes
            set
                lida = 1
            where id = v_id;

            select
                tb_notificacoes_tipos_id as code,
                valor
            from tb_notificacoes
            where id = v_id;

        COMMIT;
    END
    `), console.log('::: SP_SELECT_NOTIFICACAO_AGENTE')
}
