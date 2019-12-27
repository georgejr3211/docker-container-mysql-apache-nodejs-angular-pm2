exports.tb_veterinarios = async (migration, Sequelize) => {
    await migration.createTable('tb_veterinarios', {
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
        "crmv": {
            "type": Sequelize.STRING(45),
            "field": "crmv",
            "allowNull": true
        },
        "email": {
            "type": Sequelize.STRING(45),
            "field": "email",
            "allowNull": false
        },
        "telefone": {
            "type": Sequelize.STRING(45),
            "field": "telefone",
            "allowNull": false
        },
        "codigo": {
            "type": Sequelize.STRING(45),
            "field": "codigo",
            "allowNull": true
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
    }, console.log("::: #tb_veterinarios")
    )
}