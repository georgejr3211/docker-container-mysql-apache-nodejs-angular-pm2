exports.tb_acl_grupos = async (migration, Sequelize) => {    
    await migration.createTable('tb_acl_grupos', {
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
            "descricao": {
                "type": Sequelize.STRING(255),
                "field": "descricao",
                "allowNull": true
            },
            "status": {
                "type": Sequelize.BOOLEAN,
                "field": "status",
                "defaultValue": "1",
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
            },
        },console.log("::: #tb_acl_grupos")
       )
    
}