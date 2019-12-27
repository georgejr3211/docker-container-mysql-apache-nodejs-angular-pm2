exports.tb_backup_logs = async (migration, Sequelize) => {
    await migration.createTable('tb_backup_logs', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "status": {
            "type": Sequelize.STRING(45),
            "field": "status",
            "allowNull": false
        },
        "detalhes": {
            "type": Sequelize.STRING(255),
            "field": "detalhes",
            "allowNull": false
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    }, console.log("::: #tb_backup_logs")
    )
}
