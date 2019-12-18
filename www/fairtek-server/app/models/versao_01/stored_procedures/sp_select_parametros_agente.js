exports.sp_select_parametros_agente = async (migration, Sequelize) => {
    var user_sp_select_parametros_agente = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_select_parametros_agente`(p_id integer)';
    await migration.sequelize.query(`
        ${user_sp_select_parametros_agente}
        BEGIN
            START TRANSACTION;
                select
                    nome,
                    t_refresh_pagina,
                    t_varredura_rede,
                    t_varredura_notificacao
                from
                    tb_parametros
                where
                    id = @p_id and ativo =1;

            COMMIT;
        END
        `), console.log('::: SP_SELECT_PARAMETROS_AGENTE')
}
