var variaveis = require('../../../../../config/environment')
exports.tb_acl_permissoes = async (migration, Sequelize) => {
    await migration.createTable('tb_acl_permissoes', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_acl_grupos_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_acl_grupos_id",
            "allowNull": false
        },
        "tb_acl_regras_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_acl_regras_id",
            "allowNull": false
        },
        "status": {
            "type": Sequelize.BOOLEAN,
            "field": "status",
            "defaultValue": "0",
            "allowNull": false
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    }, console.log("::: #tb_acl_permissoes")
    ).then(async fk => {
        var tabela = "`tb_acl_permissoes`";
        var fk_nome_tb_acl_grupos = "`tb_acl_permissoes_ibfk_1`";
        var fk_coluna_tb_acl_grupos = "`tb_acl_grupos_id`";
        var referencia_tb_acl_grupos = "`tb_acl_grupos`";
        var fk_nome_tb_acl_permissoes = "`tb_acl_permissoes_ibfk_2`";
        var fk_coluna_tb_acl_permissoes = "`tb_acl_regras_id`";
        var referencia_tb_acl_permissoes = "`tb_acl_regras`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome_tb_acl_grupos}
          FOREIGN KEY (${fk_coluna_tb_acl_grupos})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_tb_acl_grupos} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT,
        ADD CONSTRAINT ${fk_nome_tb_acl_permissoes}
          FOREIGN KEY (${fk_coluna_tb_acl_permissoes})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_tb_acl_permissoes} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
        `)
    }).catch(error => console.log('#tb_fazendas ─ FK', error))
}