exports.sp_insert_notificacao_novo_dosador_fim = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_novo_dosador_fim = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_novo_dosador_fim`(p_dosador_mac varchar(45), p_valor text)';
    await migration.sequelize.query(`
        ${user_sp_insert_notificacao_novo_dosador_fim}
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
                    4,
                    p_valor,
                    now()
                );

                if (locate("Sucesso", p_valor) <> 0 ) then
                    update tb_dosadores set ativo=1, ativo_rede=1 where codigo = p_dosador_mac;
                end if;

            COMMIT;

        END
        `), console.log('::: SP_INSERT_NOTIFICACAO_NOVO_DOSADOR_FIM')
}
