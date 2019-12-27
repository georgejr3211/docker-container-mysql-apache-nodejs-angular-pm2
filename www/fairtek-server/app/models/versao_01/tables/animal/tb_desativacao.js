exports.tb_desativacao = async (migration, Sequelize) => {
   await migration.createTable('tb_desativacao', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
            "allowNull": false
        },
        "motivo": {
            "type": Sequelize.STRING(255),
            "field": "motivo",
            "allowNull": false
        },
        "observacao": {
            "type": Sequelize.STRING(255),
            "field": "observacao",
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
    }, console.log("::: #tb_desativacao")
    )
}