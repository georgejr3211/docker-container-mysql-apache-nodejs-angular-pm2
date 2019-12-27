exports.sp_insert_dosador = async (migration, Sequelize) => {
    var user_sp_insert_dosador = 'CREATE DEFINER=`fairtek`@`%` PROCEDURE `sp_insert_dosador`(p_codigo varchar(45))';
    await migration.sequelize.query(`
        ${user_sp_insert_dosador}
        BEGIN
            START TRANSACTION;

                IF EXISTS (select * from tb_dosadores where codigo = p_codigo) THEN
                    update tb_dosadores set ativo=1, ativo_rede=0, excluido=0 where codigo = p_codigo;
                ELSE
                    insert into tb_dosadores
                    (
                        codigo,
                        created,
                        updated,
                        ativo
                    )
                    values
                    (
                        p_codigo,
                        now(),
                        now(),
                        1
                    );

                    set @v_id = last_insert_id();
                    insert into tb_eventos_parametros (tb_dosadores_id) values (@v_id);

                END IF;

            COMMIT;
        END
        `), console.log('::: SP_INSERT_DOSADOR')
}