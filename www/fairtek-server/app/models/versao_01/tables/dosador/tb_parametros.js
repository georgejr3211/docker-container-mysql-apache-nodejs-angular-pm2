exports.tb_parametros = async (migration, Sequelize) => {
    await migration.createTable('tb_parametros', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "primaryKey": true,
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "t_refresh_pagina": {
            "type": Sequelize.TIME,
            "field": "t_refresh_pagina",
            "allowNull": false
        },  
        "t_atualizacao_bd": {
            "type": Sequelize.TIME,
            "field": "t_atualizacao_bd",
            "allowNull": false
        },
        "t_varredura_notificacao": {
            "type": Sequelize.TIME,
            "field": "t_varredura_notificacao",
            "defaultValue": "00:00:10",
            "allowNull": false
        },
        "t_varredura_rede": {
            "type": Sequelize.TIME,
            "field": "t_varredura_rede",
            "defaultValue": "00:00:10",
            "allowNull": false
        },
        "ativo": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo",
            "defaultValue": "0",
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
    }, console.log("::: #tb_parametros")
    )
}