exports.sp_lista_dosadores = async (migration, Sequelize) => {
    var user_sp_lista_dosadores = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_lista_dosadores`()';
    await migration.sequelize.query(`
        ${user_sp_lista_dosadores}
        BEGIN

            START TRANSACTION;

                select
                    tbd.id as id_dosador,
                    tbd.codigo as mac_dosador
                from tb_dosadores tbd
                where tbd.excluido = 0 and tbd.ativo_rede=1;

            COMMIT;
        END
        `), console.log('::: SP_LISTA_DOSADORES')
}
