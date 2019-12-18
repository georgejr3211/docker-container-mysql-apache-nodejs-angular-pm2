var variaveis = require('../../../../../config/environment')
exports.tb_eventos_parametros = async (migration, Sequelize) => {
    await migration.createTable('tb_eventos_parametros', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_dosadores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dosadores_id",
            "unique": true,
            "allowNull": false
        },
        "pTi": {
            "type": Sequelize.INTEGER(11),
            "field": "pTi",
            "defaultValue": "450",
            "allowNull": false
        },
        "pTd": {
            "type": Sequelize.INTEGER(11),
            "field": "pTd",
            "defaultValue": "0",
            "allowNull": false
        },
        "pTa": {
            "type": Sequelize.INTEGER(11),
            "field": "pTa",
            "defaultValue": "7000",
            "allowNull": false
        },
        "pTp": {
            "type": Sequelize.INTEGER(11),
            "field": "pTp",
            "defaultValue": "1000",
            "allowNull": false
        },
        "pTr": {
            "type": Sequelize.INTEGER(11),
            "field": "pTr",
            "defaultValue": "500",
            "allowNull": false
        },
        "pTs": {
            "type": Sequelize.INTEGER(11),
            "field": "pTs",
            "defaultValue": "3000",
            "allowNull": false
        },
        "pTar": {
            "type": Sequelize.INTEGER(11),
            "field": "pTar",
            "defaultValue": "60000",
            "allowNull": false
        }
    },console.log("::: #tb_eventos_parametros")
    ).then(async fk => {
        var tabela = "`tb_eventos_parametros`";
        var fk_nome = "`fk_tb_eventos_parametros_tb_dosadores1`";
        var fk_coluna = "`tb_dosadores_id`";
        var referencia = "`tb_dosadores`";
       await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_eventos_parametros ─ FK',error))
}