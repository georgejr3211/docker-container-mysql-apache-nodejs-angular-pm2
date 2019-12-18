exports.sp_busca_n_animais = async (migration, Sequelize) => {
    var user_sp_busca_n_animais = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_busca_n_animais`()'
    await migration.sequelize.query(`
        ${user_sp_busca_n_animais}
        BEGIN
            Select Max(tba.id_rede) as nanimais
            from tb_animais tba
            where ativo=1 and excluido=0;
            COMMIT;
        END`),  console.log('::: SP_BUSCA_N_ANIMAIS')
}