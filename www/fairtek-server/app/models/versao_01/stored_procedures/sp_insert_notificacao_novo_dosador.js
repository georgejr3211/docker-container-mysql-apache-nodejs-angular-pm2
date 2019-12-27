exports.sp_insert_notificacao_novo_dosador = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_novo_dosador = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_novo_dosador`(p_valor text)';
    await migration.sequelize.query(`
        ${user_sp_insert_notificacao_novo_dosador}
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
                    2,
                    p_valor,
                    now()
                );

            COMMIT;

        END
        `), console.log('::: SP_INSERT_NOTIFICACAO_NOVO_DOSADOR')
}
