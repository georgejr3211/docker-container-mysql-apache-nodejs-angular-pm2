var variaveis = require('../../../../../config/environment')
exports.tb_animais_movimentacoes = async (migration, Sequelize) => {
    await migration.createTable('tb_animais_movimentacoes', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "tb_animal_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_animal_id",
            "allowNull": false
        },
        "tb_dieta_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_dieta_id",
            "allowNull": true
        },
        "dt_inseminacao": {
            "type": Sequelize.DATE,
            "field": "dt_inseminacao",
            "allowNull": true
        },
        "dt_movimentacao": {
            "type": Sequelize.DATE,
            "field": "dt_movimentacao",
            "allowNull": false
        },
        "motivo": {
            "type": Sequelize.STRING(255),
            "field": "motivo",
            "allowNull": true
        },
        "status": {
            "type": Sequelize.BOOLEAN,
            "field": "status",
            "allowNull": false
        },
        "tb_setor_tipo_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_setor_tipo_id",
            "allowNull": false
        },
        "tb_escore_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_escore_id",
            "allowNull": true
        },
        "tb_baias_id": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_baias_id",
            "allowNull": true
        },
        "tb_tempo_dosagem": {
            "type": Sequelize.INTEGER(11),
            "field": "tb_tempo_dosagem",
            "allowNull": true
        },
        "created": {
            "type": Sequelize.DATE,
            "field": "created",
            "allowNull": false
        }
    },console.log("::: #tb_animais_movimentacoes")
    ).then(async fk => {
        var tabela = "`tb_animais_movimentacoes`";
        var fk_nome_dietas = "`fk_tb_animais_movimentacoes_1`";
        var fk_coluna_dietas = "`tb_dieta_id`";
        var referencia_dietas = "`tb_dietas`";
        var fk_nome_animais = "`fk_tb_animais_movimentacoes_2`";
        var fk_coluna_animais = "`tb_animal_id`";
        var referencia_animais = "`tb_animais`";
        var fk_nome_escores = "`fk_tb_animais_movimentacoes_3`";
        var fk_coluna_escores = "`tb_escore_id`";
        var referencia_escores = "`tb_escores`";
        var fk_nome_baias = "`fk_tb_animais_movimentacoes_4`";
        var fk_coluna_baias = "`tb_baias_id`";
        var referencia_baias = "`tb_baias`";
        var fk_nome_setores = "`fk_tb_animais_movimentacoes_5`";
        var fk_coluna_setores = "`tb_setor_tipo_id`";
        var referencia_setores = "`tb_setores_tipos`";
    
        await migration.sequelize.query(`
        ALTER TABLE ${variaveis.sequelize['fairtek']}.${tabela}
        ADD CONSTRAINT ${fk_nome_dietas}
          FOREIGN KEY (${fk_coluna_dietas})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_dietas} (${variaveis.sequelize['id']})
          ON DELETE RESTRICT
          ON UPDATE RESTRICT,
        ADD CONSTRAINT ${fk_nome_animais}
          FOREIGN KEY (${fk_coluna_animais})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_animais} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        ADD CONSTRAINT ${fk_nome_escores}
          FOREIGN KEY (${fk_coluna_escores})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_escores} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,  
        ADD CONSTRAINT ${fk_nome_baias}
          FOREIGN KEY (${fk_coluna_baias})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_baias} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,   
        ADD CONSTRAINT ${fk_nome_setores}
          FOREIGN KEY (${fk_coluna_setores})
          REFERENCES ${variaveis.sequelize['fairtek']}.${referencia_setores} (${variaveis.sequelize['id']})
          ON DELETE NO ACTION
          ON UPDATE NO ACTION;  
        `)
    }).catch( error => console.log('#tb_animais_movimentacoes ─ FK', error))
}