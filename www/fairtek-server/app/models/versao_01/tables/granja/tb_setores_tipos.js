exports.tb_setores_tipos = async (migration, Sequelize) => {
    await migration.createTable('tb_setores_tipos', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
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
    }, console.log("::: #tb_setores_tipos")).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_setores_tipos', [
            { nome: 'Área Externa', updated: '2018-04-20 14:15:00', created: '2018-04-20 14:14:00', excluido: '0' },
            { nome: 'Gestação', updated: '2018-04-20 14:17:00', created: '2018-04-20 14:16:00', excluido: '0' }
        ]))
        return true
    }).catch(error => console.log(error))
}