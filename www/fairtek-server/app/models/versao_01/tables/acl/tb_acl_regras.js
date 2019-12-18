exports.tb_acl_regras = async (migration, Sequelize) => {
    await migration.createTable('tb_acl_regras', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "menu": {
            "type": Sequelize.STRING(100),
            "field": "menu",
            "allowNull": false
        },
        "acao": {
            "type": Sequelize.STRING(45),
            "field": "acao",
            "allowNull": false
        },
        "status": {
            "type": Sequelize.BOOLEAN,
            "field": "status",
            "defaultValue": "1",
            "allowNull": false
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    }, console.log("::: #tb_acl_regras"))
}