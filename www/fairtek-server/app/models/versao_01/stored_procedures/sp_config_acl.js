exports.sp_config_acl = async (migration, Sequelize) => {
    var user_sp_config_acl = 'CREATE DEFINER=`fairtek`@`localhost` PROCEDURE `sp_config_acl`()';
    var sp_tb_acl_grupos = '`tb_acl_grupos`';
    var sp_tb_acl_regras = '`tb_acl_regras`';
    var sp_tb_acl_permissoes = '`tb_acl_permissoes`';
    var sp_tb_acl_grupos_id = '`tb_acl_grupos_id`';
    var sp_tb_acl_regras_id = '`tb_acl_regras_id`';
    var sp_id = '`id`';
    var sp_nome = '`nome`';
    var sp_descricao = '`descricao`';
    var sp_status = '`status`';
    var sp_menu = '`menu`';
    var sp_acao = '`acao`';
    var sp_email = '`email`';
    var sp_admin = '`admin`';
    var sp_senha = '`senha`';
    var sp_ativo = '`ativo`';
    var sp_excluido = '`excluido`';
    var sp_created = '`created`';
    var sp_updated = '`updated`';
    await migration.sequelize.query(`
        ${user_sp_config_acl}
        BEGIN
            DECLARE i INT;
            DECLARE qtd_regras INT;

            DROP TABLE IF EXISTS tb_acl_permissoes;

            ALTER TABLE tb_usuarios
                DROP FOREIGN KEY fk_tb_grupos_id;
            ALTER TABLE  tb_usuarios
                DROP COLUMN tb_acl_grupos_id;
            DROP TABLE IF EXISTS tb_acl_regras;
            DROP TABLE IF EXISTS tb_acl_grupos;

            CREATE TABLE ${sp_tb_acl_grupos} (
            ${sp_id} INT NOT NULL AUTO_INCREMENT,
            ${sp_nome} VARCHAR(45) NOT NULL,
            ${sp_descricao} VARCHAR(255) NULL DEFAULT NULL,
            ${sp_status} TINYINT(1) NOT NULL DEFAULT '1',
            ${sp_excluido} TINYINT(1) NOT NULL DEFAULT '0',
            ${sp_created} DATETIME NOT NULL,
            ${sp_updated} DATETIME NOT NULL,
            PRIMARY KEY (${sp_id})
        );
                CREATE TABLE ${sp_tb_acl_regras} (
            ${sp_id} INT NOT NULL AUTO_INCREMENT,
            ${sp_menu} VARCHAR(100) NOT NULL,
            ${sp_acao} VARCHAR(45) NOT NULL,
            ${sp_status} TINYINT(1) NOT NULL DEFAULT '1',
            ${sp_created} DATETIME NOT NULL,
            PRIMARY KEY (${sp_id})
        );

                CREATE TABLE ${sp_tb_acl_permissoes} (
            ${sp_id} INT NOT NULL AUTO_INCREMENT,
            ${sp_tb_acl_grupos_id} INT NOT NULL,
            ${sp_tb_acl_regras_id} INT NOT NULL,
            ${sp_status} TINYINT(1) NOT NULL DEFAULT '0',
            ${sp_created} DATETIME NOT NULL,
            PRIMARY KEY (${sp_id}),
            FOREIGN KEY (${sp_tb_acl_grupos_id})
                REFERENCES tb_acl_grupos (id),
            FOREIGN KEY (${sp_tb_acl_regras_id})
                REFERENCES tb_acl_regras (id)
        );
        ALTER TABLE tb_usuarios ADD tb_acl_grupos_id INT(11) NOT NULL DEFAULT 1;
        INSERT INTO tb_acl_grupos(${sp_nome},${sp_descricao},${sp_status},${sp_created},${sp_updated},${sp_excluido}) VALUES ('ADMIN','grupo de administradores',1,NOW(),NOW(),0), ('PADRÃO','não informado',1,NOW(),NOW(),0);

        ALTER TABLE tb_usuarios
            ADD CONSTRAINT fk_tb_grupos_id
                FOREIGN KEY (tb_acl_grupos_id)
                    REFERENCES tb_acl_grupos(id);

        DELETE FROM tb_usuarios;
        ALTER TABLE tb_usuarios AUTO_INCREMENT = 1;
                INSERT INTO tb_usuarios (${sp_nome},${sp_email},${sp_admin},${sp_senha},${sp_updated},${sp_created},${sp_excluido},${sp_ativo},${sp_tb_acl_grupos_id})VALUES('master','oficina5@fairtek',1,'$2a$10$3srXflrh3pifh.CklCpW3.BkezJaQXKsKIKyFt5I1dNVGCZpXr/QW',NOW(),NOW(),0,1,1);

                INSERT INTO tb_acl_regras (${sp_menu}, ${sp_acao}, ${sp_status}, ${sp_created})
                    VALUES
                        ('dashboard', 'read', 1, NOW()),
                        ('supervisorio', 'read', 1, NOW()),
                        ('notificacoes', 'read', 1, NOW()),
                        ('notificacoes', 'edit', 1, NOW()),
                        ('gerentes', 'read', 1, NOW()),
                        ('gerentes', 'new', 1, NOW()),
                        ('gerentes', 'edit', 1, NOW()),
                        ('gerentes', 'delete',1, NOW()),
                        ('operadores', 'read', 1, NOW()),
                        ('operadores', 'new', 1, NOW()),
                        ('operadores', 'edit', 1, NOW()),
                        ('operadores', 'delete', 1, NOW()),
                        ('nutricionistas', 'read', 1, NOW()),
                        ('nutricionistas', 'new', 1, NOW()),
                        ('nutricionistas', 'edit', 1, NOW()),
                        ('nutricionistas', 'delete', 1, NOW()),
                        ('tiposDietas', 'read', 1, NOW()),
                        ('tiposDietas', 'new', 1, NOW()),
                        ('tiposDietas', 'edit', 1, NOW()),
                        ('tiposDietas', 'delete', 1, NOW()),
                        ('veterinarios', 'read', 1, NOW()),
                        ('veterinarios', 'new', 1, NOW()),
                        ('veterinarios', 'edit', 1, NOW()),
                        ('veterinarios', 'delete', 1, NOW()),
                        ('motDesativacao', 'read', 1, NOW()),
                        ('motDesativacao', 'new', 1, NOW()),
                        ('motDesativacao', 'edit', 1, NOW()),
                        ('motDesativacao', 'delete', 1, NOW()),
                        ('granjas', 'read', 1, NOW()),
                        ('granjas', 'new', 1, NOW()),
                        ('granjas', 'edit', 1, NOW()),
                        ('granjas', 'delete', 1, NOW()),
                        ('galpoes', 'read', 1, NOW()),
                        ('galpoes', 'new', 1, NOW()),
                        ('galpoes', 'edit', 1, NOW()),
                        ('galpoes', 'delete', 1, NOW()),
                        ('baias', 'read', 1, NOW()),
                        ('baias', 'new', 1, NOW()),
                        ('baias', 'edit', 1, NOW()),
                        ('baias', 'delete', 1, NOW()),
                        ('chips', 'read', 1, NOW()),
                        ('chips', 'new', 1, NOW()),
                        ('chips', 'edit', 1, NOW()),
                        ('chips', 'delete', 1, NOW()),
                        ('escores', 'read', 1, NOW()),
                        ('escores', 'new', 1, NOW()),
                        ('escores', 'edit', 1, NOW()),
                        ('escores', 'delete', 1, NOW()),
                        ('geneticas', 'read', 1, NOW()),
                        ('geneticas', 'new', 1, NOW()),
                        ('geneticas', 'edit', 1, NOW()),
                        ('geneticas', 'delete', 1, NOW()),
                        ('dietas', 'read', 1, NOW()),
                        ('dietas', 'new', 1, NOW()),
                        ('dietas', 'edit', 1, NOW()),
                        ('dietas', 'delete', 1, NOW()),
                        ('animais', 'read', 1, NOW()),
                        ('animais', 'new', 1, NOW()),
                        ('animais', 'edit', 1, NOW()),
                        ('animais', 'delete', 1, NOW()),
                        ('movimentacoes', 'read', 1, NOW()),
                        ('movimentacoes', 'new', 1, NOW()),
                        ('movimentacoes', 'edit',1, NOW()),
                        ('movimentacoes', 'delete',1, NOW()),
                        ('localBackup', 'read', 1, NOW()),
                        ('localBackup', 'new', 1, NOW()),
                        ('cloudBackup', 'read', 1, NOW()),
                        ('cloudBackup', 'new', 1, NOW()),
                        ('assistencia', 'read', 1, NOW()),
                        ('assistencia', 'new', 1, NOW()),
                        ('calibracao', 'read', 1, NOW()),
                        ('calibracao', 'new', 1, NOW()),
                        ('tiposNotificacao', 'read', 1, NOW()),
                        ('tiposNotificacao', 'new', 1, NOW()),
                        ('tiposNotificacao', 'edit', 1, NOW()),
                        ('tiposNotificacao', 'delete', 1, NOW()),
                        ('dosadores', 'read', 1, NOW()),
                        ('dosadores', 'new', 1, NOW()),
                        ('dosadores', 'edit', 1, NOW()),
                        ('dosadores', 'delete', 1, NOW()),
                        ('produtor', 'read', 1, NOW()),
                        ('produtor', 'new', 1, NOW()),
                        ('produtor', 'edit', 1, NOW()),
                        ('produtor', 'delete', 1, NOW()),
                        ('fazendas', 'read', 1, NOW()),
                        ('fazendas', 'new', 1, NOW()),
                        ('fazendas', 'edit', 1, NOW()),
                        ('fazendas', 'delete', 1, NOW()),
                        ('usuarios', 'read',1, NOW()),
                        ('usuarios', 'new', 1, NOW()),
                        ('usuarios', 'edit', 1, NOW()),
                        ('usuarios', 'delete', 1, NOW()),
                        ('gruposUser', 'read', 1, NOW()),
                        ('gruposUser', 'new', 1, NOW()),
                        ('gruposUser', 'edit', 1, NOW()),
                        ('gruposUser', 'delete', 1, NOW()),
                        ('restoreBackup', 'new', 1, NOW()),
                        ('suporte', 'read', 1, now()),
                        ('suporte', 'edit', 1, now());

                     SET i = 1;
                     SET qtd_regras = (SELECT COUNT(*) FROM tb_acl_regras);
                     WHILE( i <= qtd_regras) DO
                        INSERT INTO tb_acl_permissoes (${sp_tb_acl_grupos_id}, ${sp_tb_acl_regras_id}, ${sp_status}, ${sp_created}) VALUES (1, i, 1, NOW());
                        SET i = i +1;
                    END WHILE;
        END
        `), console.log('::: SP_CONFIG_ACL')
}