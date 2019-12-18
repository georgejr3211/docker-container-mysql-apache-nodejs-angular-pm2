exports.tb_notificacoes_tipos = async (migration, Sequelize) => {
    await migration.createTable('tb_notificacoes_tipos', {
        "id": {
            "type": Sequelize.INTEGER(11),
            "field": "id",
            "autoIncrement": true,
            "primaryKey": true,
            "allowNull": false
        },
        "codigo": {
            "type": Sequelize.STRING(10),
            "field": "codigo",
            "allowNull": false
        },
        "nome": {
            "type": Sequelize.STRING(45),
            "field": "nome",
            "allowNull": false
        },
        "descricao": {
            "type": Sequelize.STRING(100),
            "field": "descricao",
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
            "allowNull": false
        }
    }, console.log("::: #tb_notificacoes_tipos")).then(data => {
        migration.sequelize.query(migration.QueryGenerator.bulkInsertQuery('tb_notificacoes_tipos', [
            { codigo: 'NOPEN', nome: 'Network Open', descricao: 'Abre a rede', excluido: '0', ativo: '0' },
            { codigo: 'NDNOT', nome: 'Novo Dosador Notificacao', descricao: 'Notifica um novo Dosador', excluido: '0', ativo: '0' },
            { codigo: 'NDCFG', nome: 'Novo Dosador Configura', descricao: 'Notificação para Configurar novo dosador', excluido: '0', ativo: '0' },
            { codigo: 'NDEND', nome: 'Novo Dosador Fim', descricao: 'A Configuração do dosador foi finalizada', excluido: '0', ativo: '0' },
            { codigo: 'TAGD', nome: 'Tag Desconhecida', descricao: 'TAG do Brinco não encontrada', excluido: '0', ativo: '0' },
            { codigo: 'DRSTR', nome: 'Dosador Reset Requisiçao', descricao: 'Retira o dosador da rede', excluido: '0', ativo: '0' },
            { codigo: 'DRSTN', nome: 'Dosador Reset Notificação', descricao: 'Notifica o sucesso ou falha do reset', excluido: '0', ativo: '0' },
            { codigo: 'RUPREQ', nome: 'Receita Update Requisição', descricao: 'Requisita que o Agente atualize as dietas modificadas no dosador', excluido: '0', ativo: '0' },
            { codigo: 'RUPNOT', nome: 'Receita Update Notificação', descricao: 'Notifica se o Agente atualizou ou não as tabela de dietas', excluido: '0', ativo: '0' },
            { codigo: 'AUPREQ', nome: 'Receita Update Requisição', descricao: 'Requisita que o Agente atualize as tabela de animais', excluido: '0', ativo: '0' },
            { codigo: 'AUPNOT', nome: 'Receita Update Notificação', descricao: 'Notifica que o Agente atualizou ou não as tabela de animais', excluido: '0', ativo: '0' },
            { codigo: 'TUPREQ', nome: 'Time Update Requisição', descricao: 'Requisita a atualização dos tempos dos dosadores', excluido: '0', ativo: '0' },
            { codigo: 'TUPNOT', nome: 'Time Update Notificação', descricao: 'Notifica atualização dos tempos dos dosadores', excluido: '0', ativo: '0' },
            { codigo: 'NSTOP', nome: 'Network Stop', descricao: 'Para a rede por um tempo definido', excluido: '0', ativo: '0' },
            { codigo: '12', nome: 'Teste 03', descricao: 'Teste', excluido: '1', ativo: '1' },
            { codigo: 'ALTSTR', nome: 'Alteração Status de Ração', descricao: 'Notificação de alteração no status de ração', excluido: '0', ativo: '0' },
            { codigo: 'ALTSTM', nome: 'Alteração Status do Motor', descricao: 'Notificação de alteração no status do motor', excluido: '0', ativo: '0' },
            { codigo: 'ALTSTA', nome: 'Alteração Status da Antena', descricao: 'Notificação de alteração no status da Antena', excluido: '0', ativo: '0' },
            { codigo: 'ALTSTD', nome: 'Alteração Status do Dosador', descricao: 'Notificação de alteração no status do Dosador', excluido: '0', ativo: '0' },
            { codigo: 'RSTSYS', nome: 'Restart System ', descricao: 'Notificação de Reinicio do NUC', excluido: '0', ativo: '0' },
            { codigo: 'BKPERR', nome: 'Erro Backup', descricao: 'Erro ao realizar backup diário automaticamente', excluido: '0', ativo: '0' },
            { codigo: 'BKPSCSS', nome: 'Sucesso Backup', descricao: 'Backup diário automatico realizado com sucesso.', excluido: '0', ativo: '0' },
            { codigo: 'CLBKPSCSS', nome: 'Sucesso Cloud Backup', descricao: 'Cloud Backup realizado com Sucesso', excluido: '0', ativo: '0' },
            { codigo: 'CLBKPERR', nome: 'Erro Cloud Backup', descricao: 'Erro ao realizar o Backup Cloud', excluido: '0', ativo: '0' }
        ]))
        return true
    }).catch(
        error => {
            console.log(error)
        }
    )
}