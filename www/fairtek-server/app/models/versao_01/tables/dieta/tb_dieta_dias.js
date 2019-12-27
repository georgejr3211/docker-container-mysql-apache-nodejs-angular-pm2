var variaveis = require('../../../../../config/environment')
exports.tb_dietas_dias = async (migration, Sequelize) => {
    await migration.createTable('tb_dieta_dias', {
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
        "dia": {
            "type": Sequelize.INTEGER(11),
            "field": "dia",
            "allowNull": false
        },
        "qr": {
            "type": Sequelize.INTEGER(11),
            "field": "qr",
            "allowNull": false
        },
        "qtd": {
            "type": Sequelize.INTEGER(11),
            "field": "qtd",
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
    }, console.log("::: #tb_dieta_dias")
    ).then(async fk => {
        var tabela = "`tb_dieta_dias`";
        var fk_nome = "`fk_tb_dieta_dias_tb_dietas1`";
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
    }).catch(error => console.log('#tb_galpoes ─ FK', error))
        .then(data => {
            migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_dieta_dias', [
                { tb_dietas_id: 1, dia: 0, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 1, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 2, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 3, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 4, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 5, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 6, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 7, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 8, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 9, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' },
                { tb_dietas_id: 1, dia: 10, qr: 10, qtd: 1000, excluido: '0', ativo: '1', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' }
            ]))
            return true
        }).catch(error => console.log(error)
        )
}