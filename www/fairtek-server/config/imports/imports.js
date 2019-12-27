module.exports = {
    tb_acl_grupos: {
        versao_01:
            require('../../app/models/versao_01/tables/acl/tb_acl_grupos')
    },
    tb_veterinarios: {
        versao_01:
             require('../../app/models/versao_01/tables/gerencia/tb_veterinarios')
    },
    tb_acl_regras: {
        versao_01:
             require('../../app/models/versao_01/tables/acl/tb_acl_regras')
    },
    tb_system_version: {
        versao_01:
             require('../../app/models/versao_01/tables/sistema/tb_system_version')
    },
    tb_animais: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_animais')
    },
    tb_setores_tipos: {
        versao_01:
            require('../../app/models/versao_01/tables/granja/tb_setores_tipos')
    },
    tb_rede_dietas: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_rede_dietas')
    },
    tb_backup_logs: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_backup_logs')
    },
    tb_rede: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_rede')
    },
    tb_calendarios: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_calendarios')
    },
    tb_calibracao: {
        versao_01:
            require('../../app/models/versao_01/tables/dosador/tb_calibracao')
    },
    tb_chips: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_chips')
    },
    tb_desativacao: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_desativacao')
    },
    tb_produtores: {
        versao_01:
            require('../../app/models/versao_01/tables/gerencia/tb_produtores')
    },
    tb_parametros: {
        versao_01:
            require('../../app/models/versao_01/tables/dosador/tb_parametros')
    },
    tb_operadores: {
        versao_01:
            require('../../app/models/versao_01/tables/gerencia/tb_operadores')
    },
    tb_dietas_tipos: {
        versao_01:
            require('../../app/models/versao_01/tables/dieta/tb_dietas_tipos')
    },
    tb_nutricionistas: {
        versao_01:
            require('../../app/models/versao_01/tables/gerencia/tb_nutricionistas')
    },
    tb_escores: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_escores')
    },
    tb_notificacoes_tipos: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_notificacoes_tipos')
    },
    tb_gerentes: {
        versao_01:
            require('../../app/models/versao_01/tables/gerencia/tb_gerentes')
    },
    tb_geneticas: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_geneticas')
    },
    tb_dietas: {
        versao_01:
            require('../../app/models/versao_01/tables/dieta/tb_dietas')
    },
    tb_fazendas: {
        versao_01:
            require('../../app/models/versao_01/tables/granja/tb_fazendas')
    },
    tb_granjas: {
        versao_01:
            require('../../app/models/versao_01/tables/granja/tb_granjas')
    },
    tb_notificacoes: {
        versao_01:
            require('../../app/models/versao_01/tables/sistema/tb_notificacoes')
    },
    tb_acl_permissoes: {
        versao_01:
            require('../../app/models/versao_01/tables/acl/tb_acl_permissoes')
    },
    tb_galpoes: {
        versao_01:
            require('../../app/models/versao_01/tables/granja/tb_galpoes')
    },
    tb_dieta_dias: {
        versao_01:
            require('../../app/models/versao_01/tables/dieta/tb_dieta_dias')
    },
    tb_dietas_historico: {
        versao_01:
            require('../../app/models/versao_01/tables/dieta/tb_dietas_historico')
    },
    tb_baias: {
        versao_01:
            require('../../app/models/versao_01/tables/granja/tb_baias')
    },
    tb_dosadores: {
        versao_01:
            require('../../app/models/versao_01/tables/dosador/tb_dosadores')
    },
    tb_animais_registros: {
        versao_01:
            require('../../app/models/versao_01/tables/registro_alimentacao/tb_animais_registros')
    },
    tb_registros: {
        versao_01:
            require('../../app/models/versao_01/tables/registro_alimentacao/tb_registros')
    },
    tb_registros_status_dosador: {
        versao_01:
            require('../../app/models/versao_01/tables/dosador/tb_registros_status_dosador')
    },
    tb_animais_movimentacoes: {
        versao_01:
            require('../../app/models/versao_01/tables/animal/tb_animais_movimentacoes')
    },
    tb_alimentacao_dia: {
        versao_01:
            require('../../app/models/versao_01/tables/registro_alimentacao/tb_alimentacao_dia')
    },
    tb_usuarios: {
        versao_01:
            require('../../app/models/versao_01/tables/acl/tb_usuarios')
    },
    tb_eventos_parametros: {
        versao_01:
            require('../../app/models/versao_01/tables/dosador/tb_eventos_parametros')
    },
    tg_trigger_update_alimentacao: {
        versao_01:
            require('../../app/models/versao_01/triggers/tg_update_alimentacao')
    },
    tg_trigger_insert_alimentacao: {
        versao_01:
            require('../../app/models/versao_01/triggers/tg_insert_alimentacao')
    },
    tg_gerar_notificacoes: {
        versao_01:
            require('../../app/models/versao_01/triggers/tg_gerar_notificacoes')
    },
    f_dia_animal: {
        versao_01:
            require('../../app/models/versao_01/functions/f_dia_animal')
    },
    sp_busca_n_animais: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_busca_n_animais')
    },
    sp_config_acl: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_config_acl')
    },
    sp_insert_dosador: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_dosador')
    },
    sp_insert_dosador_registro: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_dosador_registro')
    },
    sp_insert_dosador_status_registro: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_dosador_status_registro')
    },
    sp_insert_notificacao_animais_update: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_animais_update')
    },
    sp_insert_notificacao_exclusao_dosador: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_exclusao_dosador')
    },
    sp_insert_notificacao_novo_dosador: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_novo_dosador')
    },
    sp_insert_notificacao_novo_dosador_fim: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_novo_dosador_fim')
    },
    sp_insert_notificacao_receita_uppdate: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_receita_uppdate')
    },
    sp_insert_notificacao_tag_desconhecida: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_tag_desconhecida')
    },
    sp_insert_notificacao_time_dosador: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_insert_notificacao_time_dosador')
    },
    sp_lista_animais_com_dieta_dia: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_animais_com_dieta_dia')
    },
    sp_lista_animais_qr_dia: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_animais_qr_dia')
    },
    sp_lista_animais_update: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_animais_update')
    },
    sp_lista_dietas_dias: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_dietas_dias')
    },
    sp_lista_dietas_update: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_dietas_update')
    },
    sp_lista_dosadores: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_lista_dosadores')
    },
    sp_select_notificacao_agente: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_select_notificacao_agente')
    },
    sp_select_parametros_agente: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_select_parametros_agente')
    },
    sp_select_parametros_dosador: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_select_parametros_dosador')
    },
    sp_select_parametros_dosador_update: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_select_parametros_dosador_update')
    },
    sp_update_agente_status: {
        versao_01:
            require('../../app/models/versao_01/stored_procedures/sp_update_agente_status')
    }  
}