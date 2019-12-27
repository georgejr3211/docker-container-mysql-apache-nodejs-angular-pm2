var variaveis = require('../../../../../config/environment')
exports.tb_registros_status_dosador = async (migration, Sequelize) => {
    await migration.createTable('tb_registros_status_dosador', {
        "id": {
            "type": Sequelize.BIGINT(8),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_dosadores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dosadores_id",
            "allowNull": false
        },
        "tb_baias_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_baias_id",
            "allowNull": true
        },
        "status_rede": {
            "type": Sequelize.BOOLEAN,
            "field": "status_rede",
            "allowNull": true
        },
        "status_racao": {
            "type": Sequelize.BOOLEAN,
            "field": "status_racao",
            "allowNull": true
        },
        "status_antena": {
            "type": Sequelize.BOOLEAN,
            "field": "status_antena",
            "allowNull": true
        },
        "status_motor": {
            "type": Sequelize.BOOLEAN,
            "field": "status_motor",
            "allowNull": true
        },
        "status_dosador": {
            "type": Sequelize.BOOLEAN,
            "field": "status_dosador",
            "allowNull": true
        },
        "status_memoria": {
            "type": Sequelize.BOOLEAN,
            "field": "status_memoria",
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
    }, console.log("::: #tb_registros_status_dosador")
    ).then(async fk => {
        var tabela = "`tb_registros_status_dosador`";
        var fk_nome_baias = "`fk_tb_registros_status_dosador_tb_baias1`";
        var fk_coluna_baias = "`tb_baias_id`";
        var referencia_baias = "`tb_baias`";
        var fk_nome_dosadores = "`fk_tb_registros_status_dosador_tb_dosadores1`";
        var fk_coluna_dosadores = "`tb_dosadores_id`";
        var referencia_dosadores = "`tb_dosadores`";
    
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}  
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
    }).catch( error => console.log('#tb_registros_status_dosador ─ FK', error))
}