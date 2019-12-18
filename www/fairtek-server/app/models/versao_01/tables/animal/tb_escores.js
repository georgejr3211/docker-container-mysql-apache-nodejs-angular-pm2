exports.tb_escores = async (migration, Sequelize) => {
    await migration.createTable('tb_escores', {
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
        "peso": {
            "type": Sequelize.INTEGER(10),
            "field": "peso",
            "allowNull": false
        },
        "medida": {
            "type": Sequelize.STRING(45),
            "field": "medida",
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
    }, console.log("::: #tb_escores")
    )
}