exports.tb_rede_dietas = async (migration, Sequelize) => {
    await migration.createTable('tb_rede_dietas', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "status": {
            "type": Sequelize.BOOLEAN,
            "field": "status",
            "defaultValue": "0",
            "allowNull": true
        }
    }, console.log("::: #tb_rede_dietas")).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_rede_dietas', [
            { status: '1' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' },
            { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }, { status: '0' }
        ]))
        return true
    }).catch(error => console.log(error))
}