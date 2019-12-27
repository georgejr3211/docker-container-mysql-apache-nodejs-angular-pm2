var variaveis = require('../../../../../config/environment')
exports.tb_galpoes = async (migration, Sequelize) => {
    await migration.createTable('tb_galpoes', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_granjas_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_granjas_id",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "largura": {
            "type": Sequelize.INTEGER(11),
            "field": "largura",
            "allowNull": true
        },
        "comprimento": {
            "type": Sequelize.INTEGER(11),
            "field": "comprimento",
            "allowNull": true
        },
        "codigo": {
            "type": Sequelize.STRING(45),
            "field": "codigo",
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
    }, console.log("::: #tb_galpoes")
    ).then(async fk => {
        var tabela = "`tb_galpoes`";
        var fk_nome = "`fk_tb_galpoes_tb_granjas1`";
        var fk_coluna = "`tb_granjas_id`";
        var referencia = "`tb_granjas`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_galpoes ─ FK',error))
}