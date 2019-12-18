'use strict';
/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
const Sequelize = require('sequelize');
const imports = require('../../config/imports/imports.js');

var info = {
    "versao": '1.2.0',
    "name": "fairtek",
    "created": "2019-01-09T11:10:38.736Z",
    "comment": "",
};

module.exports = {
    up: async function (migration, Sequelize) {
       //TABLES
       await imports.tb_acl_grupos.versao_01.tb_acl_grupos(migration, Sequelize);
       await imports.tb_veterinarios.versao_01.tb_veterinarios(migration, Sequelize);
       await imports.tb_acl_regras.versao_01.tb_acl_regras(migration, Sequelize);
       await imports.tb_system_version.versao_01.tb_system_version(migration, Sequelize);
       await imports.tb_animais.versao_01.tb_animais(migration, Sequelize);
       await imports.tb_setores_tipos.versao_01.tb_setores_tipos(migration, Sequelize);
       await imports.tb_rede_dietas.versao_01.tb_rede_dietas(migration, Sequelize);
       await imports.tb_backup_logs.versao_01.tb_backup_logs(migration, Sequelize);
       await imports.tb_rede.versao_01.tb_rede(migration, Sequelize);
       await imports.tb_calendarios.versao_01.tb_calendarios(migration, Sequelize);
       await imports.tb_calibracao.versao_01.tb_calibracao(migration, Sequelize);
       await imports.tb_chips.versao_01.tb_chips(migration, Sequelize);
       await imports.tb_desativacao.versao_01.tb_desativacao(migration, Sequelize);
       await imports.tb_produtores.versao_01.tb_produtores(migration, Sequelize);
       await imports.tb_parametros.versao_01.tb_parametros(migration, Sequelize);
       await imports.tb_operadores.versao_01.tb_operadores(migration, Sequelize);
       await imports.tb_dietas_tipos.versao_01.tb_dietas_tipos(migration, Sequelize);
       await imports.tb_nutricionistas.versao_01.tb_nutricionistas(migration, Sequelize);
       await imports.tb_escores.versao_01.tb_escores(migration, Sequelize);
       await imports.tb_notificacoes_tipos.versao_01.tb_notificacoes_tipos(migration, Sequelize);
       await imports.tb_gerentes.versao_01.tb_gerentes(migration, Sequelize);
       await imports.tb_geneticas.versao_01.tb_geneticas(migration, Sequelize);
       await imports.tb_dietas.versao_01.tb_dietas(migration, Sequelize);
       await imports.tb_fazendas.versao_01.tb_fazendas(migration, Sequelize);
       await imports.tb_granjas.versao_01.tb_granjas(migration, Sequelize);
       await imports.tb_notificacoes.versao_01.tb_notificacoes(migration, Sequelize);
       await imports.tb_acl_permissoes.versao_01.tb_acl_permissoes(migration, Sequelize);
       await imports.tb_galpoes.versao_01.tb_galpoes(migration, Sequelize);
       await imports.tb_dieta_dias.versao_01.tb_dietas_dias(migration, Sequelize);
       await imports.tb_dietas_historico.versao_01.tb_dietas_historico(migration, Sequelize);
       await imports.tb_baias.versao_01.tb_baias(migration, Sequelize);
       await imports.tb_dosadores.versao_01.tb_dosadores(migration, Sequelize);
       await imports.tb_animais_registros.versao_01.tb_animais_registros(migration, Sequelize);
       await imports.tb_registros.versao_01.tb_registros(migration, Sequelize);
       await imports.tb_registros_status_dosador.versao_01.tb_registros_status_dosador(migration, Sequelize);
       await imports.tb_animais_movimentacoes.versao_01.tb_animais_movimentacoes(migration, Sequelize);
       await imports.tb_alimentacao_dia.versao_01.tb_alimentacao_dia(migration, Sequelize);
       await imports.tb_usuarios.versao_01.tb_usuarios(migration, Sequelize);
       await imports.tb_eventos_parametros.versao_01.tb_eventos_parametros(migration, Sequelize);
       //TRIGGERS
       await imports.tg_trigger_update_alimentacao.versao_01.tg_update_alimentacao(migration, Sequelize);
       await imports.tg_trigger_insert_alimentacao.versao_01.tg_insert_alimentacao(migration, Sequelize);
       await imports.tg_gerar_notificacoes.versao_01.tg_gerar_notificacoes(migration, Sequelize);
       //FUNCTIONS
       await imports.f_dia_animal.versao_01.f_dia_animal(migration, Sequelize);
       //STORED PROCEDURES
       await imports.sp_busca_n_animais.versao_01.sp_busca_n_animais(migration, Sequelize);
       await imports.sp_config_acl.versao_01.sp_config_acl(migration, Sequelize);
       await imports.sp_insert_dosador.versao_01.sp_insert_dosador(migration, Sequelize);
       await imports.sp_insert_dosador_registro.versao_01.sp_insert_dosador_registro(migration, Sequelize);
       await imports.sp_insert_dosador_status_registro.versao_01.sp_insert_dosador_status_registro(migration, Sequelize);
       await imports.sp_insert_notificacao_animais_update.versao_01.sp_insert_notificacao_animais_update(migration, Sequelize);
       await imports.sp_insert_notificacao_exclusao_dosador.versao_01.sp_insert_notificacao_exclusao_dosador(migration, Sequelize);
       await imports.sp_insert_notificacao_novo_dosador.versao_01.sp_insert_notificacao_novo_dosador(migration, Sequelize);
       await imports.sp_insert_notificacao_novo_dosador_fim.versao_01.sp_insert_notificacao_novo_dosador_fim(migration, Sequelize);
       await imports.sp_insert_notificacao_receita_uppdate.versao_01.sp_insert_notificacao_receita_uppdate(migration, Sequelize);
       await imports.sp_insert_notificacao_tag_desconhecida.versao_01.sp_insert_notificacao_tag_desconhecida(migration, Sequelize);
       await imports.sp_insert_notificacao_time_dosador.versao_01.sp_insert_notificacao_time_dosador(migration, Sequelize);
       await imports.sp_lista_animais_com_dieta_dia.versao_01.sp_lista_animais_com_dieta_dia(migration, Sequelize);
       await imports.sp_lista_animais_qr_dia.versao_01.sp_lista_animais_qr_dia(migration, Sequelize);
       await imports.sp_lista_animais_update.versao_01.sp_lista_animais_update(migration, Sequelize);
       await imports.sp_lista_dietas_dias.versao_01.sp_lista_dietas_dias(migration, Sequelize);
       await imports.sp_lista_dietas_update.versao_01.sp_lista_dietas_update(migration, Sequelize);
       await imports.sp_lista_dosadores.versao_01.sp_lista_dosadores(migration, Sequelize);
       await imports.sp_select_notificacao_agente.versao_01.sp_select_notificacao_agente(migration, Sequelize);
       await imports.sp_select_parametros_agente.versao_01.sp_select_parametros_agente(migration, Sequelize);
       await imports.sp_select_parametros_dosador.versao_01.sp_select_parametros_dosador(migration, Sequelize);
       await imports.sp_select_parametros_dosador_update.versao_01.sp_select_parametros_dosador_update(migration, Sequelize);
       await imports.sp_update_agente_status.versao_01.sp_update_agente_status(migration, Sequelize);
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropAllTables();
    }
}


