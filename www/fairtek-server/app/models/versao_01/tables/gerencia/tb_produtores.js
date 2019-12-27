exports.tb_produtores = async (migration, Sequelize) => {
    await migration.createTable('tb_produtores', {
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
        "cpf_cnpj": {
            "type": Sequelize.STRING(25),
            "field": "cpf_cnpj",
            "allowNull": false
        },
        "email": {
            "type": Sequelize.STRING(45),
            "field": "email",
            "allowNull": false
        },
        "plano": {
            "type": Sequelize.INTEGER(11),
            "field": "plano",
            "allowNull": true
        },
        "endereco": {
            "type": Sequelize.STRING(100),
            "field": "endereco",
            "allowNull": false
        },
        "telefone": {
            "type": Sequelize.STRING(45),
            "field": "telefone",
            "allowNull": false
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
    }, console.log("::: #tb_produtores")
    )
}