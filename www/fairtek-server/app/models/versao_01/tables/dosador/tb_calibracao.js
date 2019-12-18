exports.tb_calibracao = async (migration, Sequelize) => {
    await migration.createTable('tb_calibracao', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "chip": {
            "type": Sequelize.INTEGER(11),
            "field": "chip",
            "allowNull": false
        },
        "peso": {
            "type": Sequelize.INTEGER(11),
            "field": "peso",
            "allowNull": false
        },
        "pta_antigo": {
            "type": Sequelize.INTEGER(11),
            "field": "pta_antigo",
            "allowNull": false
        },
        "pta_novo": {
            "type": Sequelize.INTEGER(11),
            "field": "pta_novo",
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
    }, console.log("::: #tb_calibracao")
    )
}