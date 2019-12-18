var variaveis = require('../../../../../config/environment')
exports.tb_dosadores = async (migration, Sequelize) => {
    await migration.createTable('tb_dosadores', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_baias_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_baias_id",
            "allowNull": true
        },
        "codigo": {
            "type": Sequelize.STRING(45),
            "field": "codigo",
            "unique": true,
            "allowNull": false
        },
        "ativo": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo",
            "allowNull": false
        },
        "ativo_rede": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo_rede",
            "defaultValue": "0",
            "allowNull": false
        },
        "status_racao": {
            "type": Sequelize.INTEGER(11),
            "field": "status_racao",
            "defaultValue": "0",
            "allowNull": false
        },
        "status_antena": {
            "type": Sequelize.INTEGER(11),
            "field": "status_antena",
            "defaultValue": "1",
            "allowNull": false
        },
        "status_motor": {
            "type": Sequelize.INTEGER(11),
            "field": "status_motor",
            "defaultValue": "0",
            "allowNull": false
        },
        "status_dosador": {
            "type": Sequelize.INTEGER(11),
            "field": "status_dosador",
            "defaultValue": "1",
            "allowNull": false
        },
        "status_memoria": {
            "type": Sequelize.INTEGER(11),
            "field": "status_memoria",
            "defaultValue": "1",
            "allowNull": false
        },
        "status_rede": {
            "type": Sequelize.INTEGER(11),
            "field": "status_rede",
            "defaultValue": "1",
            "allowNull": false
        },
        "status": {
            "type": Sequelize.STRING(50),
            "field": "status",
            "primaryKey": true,
            "defaultValue": "1",
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
            "defaultValue": "0",
            "allowNull": false
        },
        "ag_update": {
            "type": Sequelize.BOOLEAN,
            "field": "ag_update",
            "defaultValue": "0",
            "allowNull": false
        },
        "sincronizado": {
            "type": Sequelize.BOOLEAN,
            "field": "sincronizado",
            "defaultValue": "0",
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
    }, console.log("::: #tb_dosadores")
    ).then(async fk => {
        var tabela = "`tb_dosadores`";
        var fk_nome = "`fk_tb_dosadores_tb_baias1`";
        var fk_coluna = "`tb_baias_id`";
        var referencia = "`tb_baias`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_dosadores ─ FK',error))
}