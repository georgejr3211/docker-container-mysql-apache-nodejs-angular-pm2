exports.sp_insert_notificacao_tag_desconhecida = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_tag_desconhecida = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_tag_desconhecida`(p_valor text)';
    await migration.sequelize.query(`
        ${user_sp_insert_notificacao_tag_desconhecida}
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
                    5,
                    p_valor,
                    now()
                );

            COMMIT;

        END
        `), console.log('::: SP_INSERT_NOTIFICACAO_TAG_DESCONHECIDA')
}
