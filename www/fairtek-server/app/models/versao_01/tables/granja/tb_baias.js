var variaveis = require('../../../../../config/environment')
exports.tb_baias = async (migration, Sequelize) => {
    await migration.createTable('tb_baias', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_galpoes_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_galpoes_id",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "capacidade": {
            "type": Sequelize.INTEGER(11),
            "field": "capacidade",
            "allowNull": false
        },
        "largura": {
            "type": Sequelize.STRING(7),
            "field": "largura",
            "allowNull": true
        },
        "comprimento": {
            "type": Sequelize.STRING(7),
            "field": "comprimento",
            "allowNull": true
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
        "total": {
            "type": Sequelize.INTEGER(11),
            "field": "total",
            "allowNull": false
        },
        "espaco": {
            "type": Sequelize.INTEGER(11),
            "field": "espaco",
            "allowNull": true
        },
        "sugerido": {
            "type": Sequelize.INTEGER(11),
            "field": "sugerido",
            "allowNull": true
        },
        "femea": {
            "type": Sequelize.INTEGER(11),
            "field": "femea",
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
    }, console.log("::: #tb_baias")
    ).then(async fk => {
        var tabela = "`tb_baias`";
        var fk_nome = "`fk_tb_baias_tb_galpoes1`";
        var fk_coluna = "`tb_galpoes_id`";
        var referencia = "`tb_galpoes`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_baias ─ FK',error))
}