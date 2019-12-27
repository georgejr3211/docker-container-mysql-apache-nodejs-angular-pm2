exports.sp_lista_animais_qr_dia = async (migration, Sequelize) => {
    var user_sp_lista_animais_qr_dia = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_lista_animais_qr_dia`()';
    await migration.sequelize.query(`
        ${user_sp_lista_animais_qr_dia}
        BEGIN
            select
                tb_animais_id as id_sistema,
                tbar.qa as qa
            from tb_animais_registros tbar
            where tbar.dosador_data=curdate();
        END
        `), console.log('::: SP_LISTA_ANIMAIS_QR_DIA')
}
