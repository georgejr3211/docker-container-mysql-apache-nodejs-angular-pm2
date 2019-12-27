var variaveis = require('../../../../../config/environment')
exports.tb_notificacoes = async (migration, Sequelize) => {
    await migration.createTable('tb_notificacoes', {
        "id": {
            "type": Sequelize.BIGINT(8),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_notificacoes_tipos_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_notificacoes_tipos_id",
            "allowNull": false
        },
        "origem": {
            "type": Sequelize.STRING(5),
            "field": "origem",
            "allowNull": true
        },
        "destino": {
            "type": Sequelize.STRING(5),
            "field": "destino",
            "allowNull": true
        },
        "valor": {
            "type": Sequelize.TEXT,
            "field": "valor",
            "allowNull": false
        },
        "lida": {
            "type": Sequelize.BOOLEAN,
            "field": "lida",
            "defaultValue": "0",
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
            "defaultValue": "0",
            "allowNull": false
        },
        "st_toast": {
            "type": Sequelize.BOOLEAN,
            "field": "st_toast",
            "defaultValue": "0",
            "allowNull": false
        },
        "visualizada": {
            "type": Sequelize.BOOLEAN,
            "field": "visualizada",
            "defaultValue": "0",
            "allowNull": true
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    }, console.log("::: #tb_notificacoes")
    ).then(async fk => {
        var tabela = "`tb_notificacoes`";
        var fk_nome = "`fk_tb_notificacoes_tb_notificacoes_tipos1`";
        var fk_coluna = "`tb_notificacoes_tipos_id`";
        var referencia = "`tb_notificacoes_tipos`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(error => console.log('#tb_notificacoes ─ FK',error))
}