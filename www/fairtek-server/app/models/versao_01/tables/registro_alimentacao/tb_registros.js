var variaveis = require('../../../../../config/environment')
exports.tb_registros = async (migration, Sequelize) => {
    await migration.createTable('tb_registros', {
        "id": {
            "type": Sequelize.BIGINT(8),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_baias_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_baias_id",
            "allowNull": false
        },
        "tb_dosadores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dosadores_id",
            "allowNull": false
        },
        "tb_animais_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_animais_id",
            "allowNull": false
        },
        "qa": {
            "type": Sequelize.INTEGER(11),
            "field": "qa",
            "defaultValue": "0",
            "allowNull": false
        },
        "qa_data": {
            "type": Sequelize.DATE,
            "field": "qa_data",
            "allowNull": false
        },
        "qr_dieta": {
            "type": Sequelize.INTEGER(11),
            "field": "qr_dieta",
            "defaultValue": "0",
            "allowNull": false
        },
        "codigo_dieta": {
            "type": Sequelize.STRING(45),
            "field": "codigo_dieta",
            "allowNull": false
        },
        "dia_animal": {
            "type": Sequelize.INTEGER(11),
            "field": "dia_animal",
            "allowNull": false
        },
        "nome_dieta": {
            "type": Sequelize.STRING(45),
            "field": "nome_dieta",
            "allowNull": true
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
        }
    }, console.log("::: #tb_registros")
    ).then(async fk => {
        var tabela = "`tb_registros`";
        var fk_nome_animais = "`fk_tb_registros_tb_animais1`";
        var fk_coluna_animais = "`tb_animais_id`";
        var referencia_animais = "`tb_animais`";
        var fk_nome_baias = "`fk_tb_registros_tb_baias1`";
        var fk_coluna_baias = "`tb_baias_id`";
        var referencia_baias = "`tb_baias`";
        var fk_nome_dosadores = "`fk_tb_registros_tb_dosadores1`";
        var fk_coluna_dosadores = "`tb_dosadores_id`";
        var referencia_dosadores = "`tb_dosadores`";
    
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}  
        ADD CONSTRAINT ${fk_nome_animais}
          FOREIGN KEY (${fk_coluna_animais})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_animais} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_baias}
          FOREIGN KEY (${fk_coluna_baias})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_baias} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_dosadores}
          FOREIGN KEY (${fk_coluna_dosadores})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_dosadores} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION;     
        `)
    }).catch( error => console.log('#tb_registros ─ FK', error))
}