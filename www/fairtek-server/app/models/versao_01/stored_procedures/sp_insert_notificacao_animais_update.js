exports.sp_insert_notificacao_animais_update = async (migration, Sequelize) => {
    var user_sp_insert_notificacao_animais_update = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_notificacao_animais_update`(p_valor text)';
    await migration.sequelize.query(`
    ${user_sp_insert_notificacao_animais_update}
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
                11,
                p_valor,
                now()
            );

        COMMIT;

    END
    `),  console.log('::: SP_INSERT_NOTIFICACAO_ANIMAIS_UPDATE')
}