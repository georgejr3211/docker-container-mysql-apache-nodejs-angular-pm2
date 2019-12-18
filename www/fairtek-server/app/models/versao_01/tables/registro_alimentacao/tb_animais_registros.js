var variaveis = require('../../../../../config/environment')
exports.tb_animais_registros = async (migration, Sequelize) => {
    await migration.createTable('tb_animais_registros', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_animais_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_animais_id",
            "allowNull": false
        },
        "dia": {
            "type": Sequelize.INTEGER(11),
            "field": "dia",
            "allowNull": false
        },
        "qa": {
            "type": Sequelize.INTEGER(11),
            "field": "qa",
            "defaultValue": "0",
            "allowNull": false
        },
        "qt": {
            "type": Sequelize.INTEGER(11),
            "field": "qt",
            "defaultValue": "0",
            "allowNull": false
        },
        "dieta_codigo": {
            "type": Sequelize.STRING(45),
            "field": "dieta_codigo",
            "defaultValue": "0",
            "allowNull": false
        },
        "dosador_data": {
            "type": Sequelize.DATEONLY,
            "field": "dosador_data",
            "allowNull": false
        },
        "ult_dosador": {
            "type": Sequelize.INTEGER(11),
            "field": "ult_dosador",
            "allowNull": true
        },
        "ciclo_animal": {
            "type": Sequelize.INTEGER(11),
            "field": "ciclo_animal",
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
    }, console.log("::: #tb_animais_registros")
    ).then(async fk => {
        var tabela = "`tb_animais_registros`";
        var fk_nome = "`fk_tb_animais_registros_tb_animais1`";
        var fk_coluna = "`tb_animais_id`";
        var referencia = "`tb_animais`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_animais_registros ─ FK',error))
}