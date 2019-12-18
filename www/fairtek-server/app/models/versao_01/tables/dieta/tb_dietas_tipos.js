exports.tb_dietas_tipos = async (migration, Sequelize) => {
    await migration.createTable('tb_dietas_tipos', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(50),
            "field": "nome",
            "allowNull": false
        },
        "qtd_dias": {
            "type": Sequelize.INTEGER(11),
            "field": "qtd_dias",
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
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
    }, console.log("::: #tb_dietas_tipos")).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_dietas_tipos', [
            { nome: 'CALIBRACAO', qtd_dias: 10, excluido: '0', created: '2018-01-14 00:00:00', updated: '2018-01-14 00:00:00' }
        ]))
        return true
    }).catch(
        error => {
            console.log(error)
        }
    )
}