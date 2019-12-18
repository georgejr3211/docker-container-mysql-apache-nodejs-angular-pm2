/*****************
 * SOWTEK5000
 * 
 * Objetivo: Classe para cadastro de Logs/notificações referente aos eventos de backups automaticos
 * 
 *  * ********* */

var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);
var Moment = require('../utils/moment');

exports.postLogs = (notificacao) => {

    let log_backup = {
        status: notificacao.status,
        detalhes: notificacao.detalhes,
        created: Moment().format('YYYY-MM-DD HH:mm:ss')
    }

    let log_notificacao = {
        tb_notificacoes_tipos_id: notificacao.tb_notificacoes_tipos_id,
        valor: '{}',
        created: Moment().format('YYYY-MM-DD HH:mm:ss')
    }
    
    poolQuery.getConnection((err, connection) => {
        connection.query(`INSERT INTO tb_backup_logs SET ?`, [log_backup],
            (error, rows, fields) => {
                if (error) {
                    connection.release();
                    console.log(error.message);
                    return 'Houve um erro ao inserir Log para backup em nuvem.'
                }
                else {
                    connection.query(`INSERT INTO tb_notificacoes SET ?`, [log_notificacao],
                        (error2, rows2, fields2) => {
                            connection.release();
                            if (error2) {
                                console.log(error2.message);
                                return 'Houve um erro ao inserir notificação para backup em nuvem.'
                            }
                            else {
                                return 'Notificação de backup em nuvem gerada com sucesso.'
                            }
                        }
                    );
                }
            }
        );
    });
}