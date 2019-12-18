exports.sp_insert_notificacao_exclusao_dosador = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_exclusao_dosador = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_exclusao_dosador`(p_codigo text, p_valor text)';
    await migration.sequelize.query(`
        ${user_sp_insert_notificacao_exclusao_dosador}
        BEGIN
            START TRANSACTION;
                update tb_dosadores set ativo=0, ativo_rede=0, updated=now() where codigo = p_codigo;
                insert into tb_notificacoes
                (
                    tb_notificacoes_tipos_id,
                    valor,
                    created
                )
                values
                (
                    7,
                    p_valor,
                    now()
                );

            COMMIT;

        END
        `), console.log('::: SP_INSERT_NOTIFICACAO_EXCLUSAO_DOSADOR')
}
