var variaveis = require('../../../../../config/environment')
exports.tb_fazendas = async (migration, Sequelize) => {
    await migration.createTable('tb_fazendas', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_produtores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_produtores_id",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "localizacao": {
            "type": Sequelize.STRING(50),
            "field": "localizacao",
            "allowNull": true
        },
        "endereco": {
            "type": Sequelize.STRING(100),
            "field": "endereco",
            "allowNull": true
        },
        "email": {
            "type": Sequelize.STRING(45),
            "field": "email",
            "allowNull": false
        },
        "telefone": {
            "type": Sequelize.STRING(45),
            "field": "telefone",
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
    }, console.log("::: #tb_fazendas")
    ).then(async fk => {
        var tabela = "`tb_fazendas`";
        var fk_nome = "`fk_tb_fazendas_tb_produtores`";
        var fk_coluna = "`tb_produtores_id`";
        var referencia = "`tb_produtores`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_fazendas ─ FK',error))
}