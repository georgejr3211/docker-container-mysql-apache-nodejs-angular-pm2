exports.sp_lista_dietas_dias = async (migration, Sequelize) => {
    var user_sp_lista_dietas_dias = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_lista_dietas_dias`()';
    await migration.sequelize.query(`
        ${user_sp_lista_dietas_dias}
        BEGIN

            START TRANSACTION;

                select
                    tbd.id_rede as id_dieta,
                    tbdd.dia as dia,
                    tbdd.qtd/100 as qr
                from tb_dietas tbd
                inner join tb_dieta_dias tbdd on tbdd.tb_dietas_id = tbd.id
                where tbd.excluido = 0 and tbd.id_rede<>0 and tbdd.ativo=1;

            COMMIT;
        END
        `), console.log('::: SP_LISTA_DIETAS_DIAS')
}
