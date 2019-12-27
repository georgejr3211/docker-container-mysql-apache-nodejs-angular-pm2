var variaveis = require('../../../../../config/environment')
exports.tb_dietas_historico = async (migration, Sequelize) => {
    await migration.createTable('tb_dietas_historico', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_dietas_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dietas_id",
            "allowNull": false
        },
        "motivo": {
            "type": Sequelize.STRING(255),
            "field": "motivo",
            "allowNull": false
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    }, console.log("::: #tb_dietas_historico")
    ).then(async fk => {
        var tabela = "`tb_dietas_historico`";
        var fk_nome = "`fk_tb_dietas_id`";
        var fk_coluna = "`tb_dietas_id`";
        var referencia = "`tb_dietas`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_dietas_historico ─ FK',error))
}