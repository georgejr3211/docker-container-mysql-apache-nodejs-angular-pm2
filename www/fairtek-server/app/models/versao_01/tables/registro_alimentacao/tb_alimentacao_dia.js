var variaveis = require('../../../../../config/environment')
exports.tb_alimentacao_dia = async (migration, Sequelize) => {
    await migration.createTable('tb_alimentacao_dia', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "ID_ANIMAL": {
            "type": Sequelize.INTEGER(11),
            "field": "ID_ANIMAL",
            "allowNull": false
        },
        "HORA_PARCIAL": {
            "type": Sequelize.INTEGER(11),
            "field": "HORA_PARCIAL",
            "allowNull": true
        },
        "HORA_COMPLET": {
            "type": Sequelize.INTEGER(11),
            "field": "HORA_COMPLET",
            "allowNull": true
        },
        "DIA": {
            "type": Sequelize.DATEONLY,
            "field": "DIA",
            "allowNull": false
        }
    }, console.log("::: #tb_alimentacao_dia")
    ).then(async fk => {
        var tabela = "`tb_alimentacao_dia`";
        var fk_nome = "`fk_tb_alimentacao_dia_1`";
        var fk_coluna = "`ID_ANIMAL`";
        var referencia = "`tb_animais`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_alimentacao_dia ─ FK',error))
}