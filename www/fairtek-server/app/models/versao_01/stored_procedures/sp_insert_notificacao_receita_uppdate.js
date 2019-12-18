exports.sp_insert_notificacao_receita_uppdate = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_receita_uppdate = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_receita_update`(p_valor text)';
    await migration.sequelize.query(`
        ${user_sp_insert_notificacao_receita_uppdate}
        BEGIN
            START TRANSACTION;

                insert into tb_notificacoes
                (
                    tb_notificacoes_tipos_id,
                    valor,
                    created
                )
                values
                (
                    9,
                    p_valor,
                    now()
                );

            COMMIT;

        END
        `), console.log('::: SP_INSERT_NOTIFICACAO_RECEITA_UPDATE')
}
