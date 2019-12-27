exports.sp_select_parametros_dosador_update = async (migration, Sequelize) => {
    var user_sp_select_parametros_dosador_update = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_select_parametros_dosador_update`()';
    await migration.sequelize.query(`
        ${user_sp_select_parametros_dosador_update}
        BEGIN
            START TRANSACTION;
                select
                    tbd.codigo as pmac,
                    tbd.id as pid,
                    tbep.pTi,
                    tbep.pTd,
                    tbep.pTa,
                    tbep.pTp,
                    tbep.pTr,
                    tbep.pTs,
                    tbep.pTar
                from tb_dosadores tbd
                inner join tb_eventos_parametros tbep on tbd.id = tbep.tb_dosadores_id
                where tbd.ativo = 1 and tbd.ag_update = 1;
            COMMIT;

        END
        `), console.log('::: SP_SELECT_PARAMETROS_DOSADOR_UPDATE')
}
