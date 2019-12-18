exports.sp_update_agente_status = async (migration, Sequelize) => {
    var user_sp_update_agente_status = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_update_agente_status`()';
    await migration.sequelize.query(`
        ${user_sp_update_agente_status}
        BEGIN
        START TRANSACTION;

             update tb_parametros set updated=now() where  id=1;

        END
        `), console.log('::: SP_UPDATE_AGENTE_STATUS')
    console.log('')
    console.log('------ MIGRATION CONCLUIDA COM SUCESSO ------')
}
