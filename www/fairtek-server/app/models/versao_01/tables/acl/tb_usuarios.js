var variaveis = require('../../../../../config/environment')
exports.tb_usuarios = async (migration, Sequelize) => {
    await migration.createTable('tb_usuarios', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_granja_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_granja_id",
            "allowNull": true
        },
        "nome": {
            "type": Sequelize.STRING(100),
            "field": "nome",
            "allowNull": false
        },
        "email": {
            "type": Sequelize.STRING(100),
            "field": "email",
            "allowNull": false
        },
        "admin": {
            "type": Sequelize.BOOLEAN,
            "field": "admin",
            "allowNull": true
        },
        "senha": {
            "type": Sequelize.CHAR(60),
            "field": "senha",
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
            "defaultValue": "0",
            "allowNull": false
        },
        "ativo": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo",
            "allowNull": false
        },
        "image": {
            "type": Sequelize.BLOB('long'),
            "field": "image",
            "allowNull": true
        },
        "last_login": {
            "type": Sequelize.DATE,
            "field": "last_login",
            "allowNull": true
        },
        "esqueceu_senha": {
            "type": Sequelize.BOOLEAN,
            "field": "esqueceu_senha",
            "defaultValue": "0",
            "allowNull": false
        },
        "tb_acl_grupos_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_acl_grupos_id",
            "defaultValue": "1",
            "allowNull": false
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        },
        "updated": {
            "type": Sequelize.DATE,
            "field": "updated",
            "allowNull": false
        }
    }, console.log("::: #tb_usuarios")
    ).then(async fk => {
        var tabela = "`tb_usuarios`";
        var fk_nome = "`fk_tb_grupos_id`";
        var fk_coluna = "`tb_acl_grupos_id`";
        var referencia = "`tb_acl_grupos`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_usuarios ─ FK',error))
}