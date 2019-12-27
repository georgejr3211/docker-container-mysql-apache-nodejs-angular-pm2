exports.tb_system_version = async (migration, Sequelize) => {
    await migration.createTable('tb_system_version', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "version": {
            "type": Sequelize.STRING(45),
            "field": "version",
            "allowNull": false
        }
    }, console.log("::: #tb_system_version")
    ).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_system_version', [
            { version: '1.2.0' }
        ]))
        return true
    }).catch(error => console.log(error))
}