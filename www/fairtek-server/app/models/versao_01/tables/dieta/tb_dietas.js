var variaveis = require('../../../../../config/environment')
exports.tb_dietas = async (migration, Sequelize) => {
    await migration.createTable('tb_dietas', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "id_rede": {
            "type": Sequelize.STRING(45),
            "field": "id_rede",
            "defaultValue": "0",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
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
        "qtd_dias": {
            "type": Sequelize.INTEGER(11),
            "field": "qtd_dias",
            "allowNull": false
        },
        "ativo": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo",
            "allowNull": true
        },
        "tipo_dieta": {
            "type": Sequelize.INTEGER(11),
            "field": "tipo_dieta",
            "defaultValue": "1",
            "allowNull": false
        },
        "dieta_calibracao": {
            "type": Sequelize.BOOLEAN,
            "field": "dieta_calibracao",
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
    }, console.log("::: #tb_dietas")).then(async fk => {
        var tabela = "`tb_dietas`";
        var fk_nome = "`fk_tb_dietas_tipos`";
        var fk_coluna = "`tipo_dieta`";
        var referencia = "`tb_dietas_tipos`";
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome}
          FOREIGN KEY (${fk_coluna})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT
        `)
    }).catch(
        error => console.log('#tb_dietas ─ FK',error)
    ).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_dietas', [
            { id_rede: '1', nome: 'CALIBRACAO', excluido: '0', ag_update: '1', qtd_dias: 10, ativo: '1', tipo_dieta: '1', dieta_calibracao: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' }

        ]))
        return true
    }).catch(
        error => console.log('#tb_dietas ─ INSERT',error))
}