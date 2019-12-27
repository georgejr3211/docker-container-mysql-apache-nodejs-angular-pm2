var variaveis = require('../../../../../config/environment')
exports.tb_granjas = async (migration, Sequelize) => {
    await migration.createTable('tb_granjas', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_fazendas_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_fazendas_id",
            "allowNull": false
        },
        "tb_veterinarios_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_veterinarios_id",
            "allowNull": false
        },
        "tb_nutricionistas_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_nutricionistas_id",
            "allowNull": false
        },
        "tb_gerentes_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_gerentes_id",
            "allowNull": false
        },
        "tb_operadores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_operadores_id",
            "allowNull": false
        },
        "tb_geneticas_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_geneticas_id",
            "allowNull": false
        },
        "tb_produtores_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_produtores_id",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "localizacao": {
            "type": Sequelize.STRING(50),
            "field": "localizacao",
            "allowNull": true
        },
        "endereco": {
            "type": Sequelize.STRING(100),
            "field": "endereco",
            "allowNull": true
        },
        "modulo_de_producao": {
            "type": Sequelize.STRING(4),
            "field": "modulo_de_producao",
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
        "plano": {
            "type": Sequelize.INTEGER(11),
            "field": "plano",
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
    }, console.log("::: #tb_granjas")
    ).then(async fk => {
        var tabela = "`tb_granjas`";
        var fk_nome_fazendas = "`fk_tb_granjas_tb_fazendas1`";
        var fk_coluna_fazendas = "`tb_fazendas_id`";
        var referencia_fazendas = "`tb_fazendas`";
        var fk_nome_geneticas = "`fk_tb_granjas_tb_geneticas1`";
        var fk_coluna_geneticas = "`tb_geneticas_id`";
        var referencia_geneticas = "`tb_geneticas`";
        var fk_nome_gerentes = "`fk_tb_granjas_tb_gerentes1`";
        var fk_coluna_gerentes = "`tb_gerentes_id`";
        var referencia_gerentes = "`tb_gerentes`";
        var fk_nome_nutricionistas = "`fk_tb_granjas_tb_nutricionistas1`";
        var fk_coluna_nutricionistas = "`tb_nutricionistas_id`";
        var referencia_nutricionistas = "`tb_nutricionistas`";
        var fk_nome_operadores = "`fk_tb_granjas_tb_operadores1`";
        var fk_coluna_operadores = "`tb_operadores_id`";
        var referencia_operadores = "`tb_operadores`";
        var fk_nome_veterinarios = "`fk_tb_granjas_tb_veterinarios1`";
        var fk_coluna_veterinarios = "`tb_veterinarios_id`";
        var referencia_veterinarios = "`tb_veterinarios`";
        var fk_nome_produtores = "`fk_tb_granjas_tb_produtores1`";
        var fk_coluna_produtores = "`tb_produtores_id`";
        var referencia_produtores = "`tb_produtores`";
    
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}  
        ADD CONSTRAINT ${fk_nome_fazendas}
          FOREIGN KEY (${fk_coluna_fazendas})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_fazendas} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_geneticas}
          FOREIGN KEY (${fk_coluna_geneticas})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_geneticas} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_gerentes}
          FOREIGN KEY (${fk_coluna_gerentes})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_gerentes} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_nutricionistas}
          FOREIGN KEY (${fk_coluna_nutricionistas})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_nutricionistas} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_operadores}
          FOREIGN KEY (${fk_coluna_operadores})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_operadores} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_veterinarios}
          FOREIGN KEY (${fk_coluna_veterinarios})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_veterinarios} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_produtores}
          FOREIGN KEY (${fk_coluna_produtores})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_produtores} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION;        
        `)
    }).catch( error => console.log('#tb_granjas ─ FK', error))
}