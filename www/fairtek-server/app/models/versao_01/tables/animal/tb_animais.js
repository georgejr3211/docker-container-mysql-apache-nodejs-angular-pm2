exports.tb_animais = async (migration, Sequelize) => {
    await migration.createTable('tb_animais', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "id_rede": {
            "type": Sequelize.INTEGER(11),
            "field": "id_rede",
            "allowNull": false
        },
        "tb_dieta_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dieta_id",
            "allowNull": true
        },
        "rfid": {
            "type": Sequelize.BIGINT(8),
            "field": "rfid",
            "allowNull": false
        },
        "tatuagem": {
            "type": Sequelize.STRING(45),
            "field": "tatuagem",
            "allowNull": false
        },
        "brinco": {
            "type": Sequelize.STRING(45),
            "field": "brinco",
            "allowNull": false
        },
        "tempo_entre_dosagem": {
            "type": Sequelize.INTEGER(11),
            "field": "tempo_entre_dosagem",
            "allowNull": true
        },
        "baias_id": {
            "type": Sequelize.INTEGER(11),
            "field": "baias_id",
            "allowNull": true
        },
        "qr": {
            "type": Sequelize.INTEGER(11),
            "field": "qr",
            "defaultValue": "0",
            "allowNull": true
        },
        "ativo": {
            "type": Sequelize.BOOLEAN,
            "field": "ativo",
            "defaultValue": "1",
            "allowNull": false
        },
        "excluido": {
            "type": Sequelize.BOOLEAN,
            "field": "excluido",
            "defaultValue": "0",
            "allowNull": false
        },
        "ag_update": {
            "type": Sequelize.BOOLEAN,
            "field": "ag_update",
            "defaultValue": "1",
            "allowNull": false
        },
        "dieta_id": {
            "type": Sequelize.INTEGER(11),
            "field": "dieta_id",
            "allowNull": true
        },
        "dt_entrada": {
            "type": Sequelize.DATEONLY,
            "field": "dt_entrada",
            "allowNull": true
        },
        "escore_id": {
            "type": Sequelize.INTEGER(11),
            "field": "escore_id",
            "allowNull": true
        },
        "gestacao": {
            "type": Sequelize.BOOLEAN,
            "field": "gestacao",
            "allowNull": true
        },
        "motivo": {
            "type": Sequelize.STRING(255),
            "field": "motivo",
            "allowNull": true
        },
        "chip": {
            "type": Sequelize.INTEGER(11),
            "field": "chip",
            "allowNull": false
        },
        "tb_setor_tipo_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_setor_tipo_id",
            "allowNull": true
        },
        "ciclo_animal": {
            "type": Sequelize.INTEGER(11),
            "field": "ciclo_animal",
            "defaultValue": "0",
            "allowNull": false
        },
        "calibracao": {
            "type": Sequelize.BOOLEAN,
            "field": "calibracao",
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
    }, console.log("::: #tb_animais")
    )
}