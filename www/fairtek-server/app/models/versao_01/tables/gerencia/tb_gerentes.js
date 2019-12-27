exports.tb_gerentes = async (migration, Sequelize) => {
    await migration.createTable('tb_gerentes', {
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
        "email": {
            "type": Sequelize.STRING(45),
            "field": "email",
            "allowNull": false
        },
        "cpf": {
            "type": Sequelize.STRING(45),
            "field": "cpf",
            "allowNull": true
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
    }, console.log("::: #tb_gerentes")
    )
}