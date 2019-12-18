exports.sp_select_parametros_dosador = async (migration, Sequelize) => {
    var user_sp_select_parametros_dosador = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_select_parametros_dosador`(p_codigo varchar(45))';
    await migration.sequelize.query(`
        ${user_sp_select_parametros_dosador}
        BEGIN
            START TRANSACTION;

                set @v_idDosador = (select id from tb_dosadores where codigo = p_codigo);

                select
                    id,
                    pTi,
                    pTd,
                    pTa,
                    pTp,
                    pTr,
                    pTs,
                    pTar
                from
                    tb_eventos_parametros
                where
                    tb_dosadores_id = @v_idDosador;

            COMMIT;
        END
        `), console.log('::: SP_SELECT_PARAMETROS_DOSADOR')
}
