/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express');
var Moment = require('../utils/moment');
var Router = express.Router();

/******************************************************************************************
MONGODB
******************************************************************************************/
var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {
        let ids = [];
        let data = Moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00')
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_notificacoes 
                              WHERE excluido <> 1  AND tb_notificacoes_tipos_id IN('2','4','5','6','7','9','11','13', '20', '21', '22')
                              AND lida = 0 AND visualizada = 0 ORDER BY id DESC`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            for (i = 0; i < rows.length; i++) {
                                if (rows[i].st_toast == 0) {
                                    ids.push(rows[i].id);
                                }

                                rows[i].valor = JSON.parse(rows[i].valor);
                                if (!rows[i].valor.estado) {
                                    rows[i].valor.estado = 'Novo'
                                }

                                //CODIGOS TIPO NOTIFICACOES
                                switch (rows[i].tb_notificacoes_tipos_id) {
                                    case 2:
                                        rows[i].tipo = 'Novo Dosador';
                                        break;

                                    case 4:
                                        rows[i].tipo = 'Configuração do Dosador';
                                        break;

                                    case 5:
                                        rows[i].tipo = `Brinco Desconhecido: ${rows[i].valor.tag_brinco}`;
                                        break;

                                    case 7:
                                        rows[i].tipo = 'Notificação de Reset de Dosador';
                                        break;

                                    case 9:
                                        rows[i].tipo = 'Notificação de Atualização de Receita';
                                        break;

                                    case 11:
                                        rows[i].tipo = 'Notificação de Atualização de Animais';
                                        break;

                                    case 13:
                                        rows[i].tipo = 'Notificação de Atualização de Parametros do Dosador';
                                        break;

                                    case 16:
                                        rows[i].tipo = "Notificação de Alteração de Status da Ração";
                                        break;

                                    case 17:
                                        rows[i].tipo = "Notificação de Alteração de Status do Motor";
                                        break;

                                    case 18:
                                        rows[i].tipo = "Notificação de Alteração de Status da Antena";
                                        break;

                                    case 19:
                                        rows[i].tipo = "Notificação de Alteração de Status do Dosador";
                                        break;

                                    case 20:
                                        rows[i].tipo = "ATENÇÃO, O SISTEMA FOI RENICIADO!";
                                        break;

                                    case 21:
                                        rows[i].tipo = "ATENÇÃO, HOUVE UM ERRO AO REALIZAR O BACKUP DIÁRIO, CONTATE O SUPORTE!";
                                        break;

                                    case 22:
                                        rows[i].tipo = "BACKUP DIÁRIO REALIZADO COM SUCESSO!";
                                }


                                if (rows[i].valor.estado) {
                                    rows[i].valor.estado
                                }
                                if (rows[i].valor.tag_brinco) {
                                    rows[i].valor.estado = 'Brinco desconhecido: ' + rows[i].valor.tag_brinco
                                }

                                rows[i].created = Moment(rows[i].created).format('DD/MM/YYYY HH:mm');

                                if (typeof rows[i].valor.status !== 'undefined') {

                                    if (rows[i].valor.status.match(/Falha.*/)) {
                                        rows[i].status_notificacao = 'danger'
                                    } else if (rows[i].valor.status.match(/Sucesso.*/)) {
                                        rows[i].status_notificacao = 'success'
                                    } else {
                                        rows[i].status_notificacao = 'info'
                                    }
                                }

                            }

                            setTimeout(function () {

                                if (ids.length > 0) {
                                    var sqlUpdate = `UPDATE tb_notificacoes SET st_toast = 1 WHERE id in (${ids})`;

                                    connection.query(sqlUpdate,
                                        function (error1, rows1, fields1) {
                                            //connection.release();
                                            if (error) {
                                               
                                                console.log('[ERROR] -> In update set st_toast');
                                                //res.status(400).send({ message: error.message }); 
                                            } else {
                                                
                                                console.log('[SUCCESS] -> In update set st_toast');
                                                //connection.release();
                                            }
                                            connection.release();
                                        });
                                }
                                else {
                                    connection.release();
                                }
                            }, 5000);
                                res.status(200).send(rows);                          
                        } else {
                            res.status(200).send([]);
                            connection.release();
                        }
                    }
                    //connection.release();
                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            tb_notificacoes_tipos_id: req.body.notificacoes_tipos_id,
            origem: req.body.origem,
            destino: req.body.destino,
            valor: req.body.valor,
            lida: 0,
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS,
                function (error, results, fields) {            
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `A notificação foi cadastrada com sucesso!`
                        })
                    }
                    connection.release();                   
                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_notificacoes WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `A notificação pesquisada não existe!`
                            })
                        }
                    }
                    connection.release();                    
                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            tb_notificacoes_tipos_id: req.body.notificacoes_tipos_id,
            origem: req.body.origem,
            destino: req.body.destino,
            valor: req.body.valor,
            lida: req.body.lida,
            st_toast: req.body.lida
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_notificacoes SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `Os dados da notificação foram atualizados com sucesso!`
                        })
                    }                    
                    connection.release();
                });
        });

    })

    //DELETA
    .delete(function (req, res) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_notificacoes SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `A notificação foi excluída com sucesso!`
                        })
                    }
                    connection.release();
                });
        });

    });
/**************
    BUSCAR NOTIFICAÇÕES PELA DATA
* ************* */
Router.route('/filtro/data/:inicio/:final')
    .get(function (req, res, fields) {
        poolQuery.getConnection(function (err, connection) {
            let ids = [];
            connection.query(`SELECT * FROM tb_notificacoes 
                              WHERE excluido <> 1 AND (created >='${req.params.inicio}' AND created <= '${req.params.final}')  
                              AND  tb_notificacoes_tipos_id IN('2','4','5','6','7','9','11','13', '20', '21', '22') ORDER BY id DESC`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            connection.release();

                            for (i = 0; i < rows.length; i++) {
                                if (rows[i].st_toast == 0) {
                                    ids.push(rows[i].id);
                                }

                                rows[i].valor = JSON.parse(rows[i].valor);
                                if (!rows[i].valor.estado) {
                                    rows[i].valor.estado = 'Novo'
                                }

                                //CODIGOS TIPO NOTIFICACOES
                                switch (rows[i].tb_notificacoes_tipos_id) {
                                    case 2:
                                        rows[i].tipo = 'Dosador';
                                        break;

                                    case 4:
                                        rows[i].tipo = 'Configuração do Dosador';
                                        break;

                                    case 5:
                                        rows[i].tipo = `Brinco Desconhecido: ${rows[i].valor.tag_brinco}`;
                                        break;

                                    case 7:
                                        rows[i].tipo = 'Notificação de Reset de Dosador';
                                        break;

                                    case 9:
                                        rows[i].tipo = 'Notificação de Atualização de Receita';
                                        break;

                                    case 11:
                                        rows[i].tipo = 'Notificação de Atualização de Animais';
                                        break;

                                    case 13:
                                        rows[i].tipo = 'Notificação de Atualização de Parametros do Dosador';
                                        break;

                                    case 16:
                                        rows[i].tipo = "Notificação de Alteração de Status da Ração";
                                        break;

                                    case 17:
                                        rows[i].tipo = "Notificação de Alteração de Status do Motor";
                                        break;

                                    case 18:
                                        rows[i].tipo = "Notificação de Alteração de Status da Antena";
                                        break;

                                    case 19:
                                        rows[i].tipo = "Notificação de Alteração de Status do Dosador";
                                        break;

                                    case 20:
                                        rows[i].tipo = "ATENÇÃO, O SISTEMA FOI RENICIADO!";
                                        break;

                                    case 21:
                                        rows[i].tipo = "ATENÇÃO, HOUVE UM ERRO AO REALIZAR O BACKUP DIÁRIO, CONTATE O SUPORTE!";
                                        break;

                                    case 22:
                                        rows[i].tipo = "BACKUP DIÁRIO REALIZADO COM SUCESSO!";
                                }



                                /*                    if (rows[i].tb_notificacoes_tipos_id === 2) { rows[i].tipo = 'dosador' }
                                                   if (rows[i].tb_notificacoes_tipos_id === 4) { rows[i].tipo = 'configuração do dosador' }
                                                   if (rows[i].tb_notificacoes_tipos_id === 5) { rows[i].tipo = '' } */

                                if (rows[i].valor.estado) {
                                    rows[i].valor.estado
                                }
                                if (rows[i].valor.tag_brinco) {
                                    rows[i].valor.estado = 'Brinco desconhecido: ' + rows[i].valor.tag_brinco
                                }

                                rows[i].created = Moment(rows[i].created).format('DD/MM/YYYY HH:mm');

                                if (typeof rows[i].valor.status !== 'undefined') {

                                    if (rows[i].valor.status.match(/Falha.*/)) {
                                        rows[i].status_notificacao = 'danger'
                                    } else if (rows[i].valor.status.match(/Sucesso.*/)) {
                                        rows[i].status_notificacao = 'success'
                                    } else {
                                        rows[i].status_notificacao = 'info'
                                    }
                                }

                            }
                                res.status(200).send(rows);
                        } else {
                            res.status(200).send([]);
                            //connection.release();
                        }
                    }

                });
        });

    });
/**************
    BUSCAR NOTIFICAÇÕES PELO TIPO
* ************* */

Router.route('/filtro/tipo/:valor')
    .get(function (req, res, fields) {
        console.log("req:", req.params.valor);
        poolQuery.getConnection(function (err, connection) {
            let ids = [];
            connection.query(`SELECT * FROM tb_notificacoes 
                WHERE excluido <> 1 AND tb_notificacoes_tipos_id NOT IN (16, 17, 18, 19, 23) 
                AND  tb_notificacoes_tipos_id = ${req.params.valor} ORDER BY id DESC`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            connection.release();

                            for (i = 0; i < rows.length; i++) {
                                if (rows[i].st_toast == 0) {
                                    ids.push(rows[i].id);
                                }

                                rows[i].valor = JSON.parse(rows[i].valor);
                                if (!rows[i].valor.estado) {
                                    rows[i].valor.estado = 'Novo'
                                }

                                //CODIGOS TIPO NOTIFICACOES
                                switch (rows[i].tb_notificacoes_tipos_id) {
                                    case 2:
                                        rows[i].tipo = 'Novo Dosador';
                                        break;

                                    case 4:
                                        rows[i].tipo = 'Configuração do Dosador';
                                        break;

                                    case 5:
                                        rows[i].tipo = `Brinco Desconhecido: ${rows[i].valor.tag_brinco}`;
                                        break;

                                    case 7:
                                        rows[i].tipo = 'Notificação de Reset de Dosador';
                                        break;

                                    case 9:
                                        rows[i].tipo = 'Notificação de Atualização de Receita';
                                        break;

                                    case 11:
                                        rows[i].tipo = 'Notificação de Atualização de Animais';
                                        break;

                                    case 13:
                                        rows[i].tipo = 'Notificação de Atualização de Parametros do Dosador';
                                        break;

                                    case 16:
                                        rows[i].tipo = "Notificação de Alteração de Status da Ração";
                                        break;

                                    case 17:
                                        rows[i].tipo = "Notificação de Alteração de Status do Motor";
                                        break;

                                    case 18:
                                        rows[i].tipo = "Notificação de Alteração de Status da Antena";
                                        break;

                                    case 19:
                                        rows[i].tipo = "Notificação de Alteração de Status do Dosador";
                                        break;

                                    case 20:
                                        rows[i].tipo = "ATENÇÃO, O SISTEMA FOI RENICIADO!";
                                        break;

                                    case 21:
                                        rows[i].tipo = "ATENÇÃO, HOUVE UM ERRO AO REALIZAR O BACKUP DIÁRIO, CONTATE O SUPORTE!";
                                        break;

                                    case 22:
                                        rows[i].tipo = "BACKUP DIÁRIO REALIZADO COM SUCESSO!";
                                }


                                if (rows[i].valor.estado) {
                                    rows[i].valor.estado
                                }
                                if (rows[i].valor.tag_brinco) {
                                    rows[i].valor.estado = 'Brinco desconhecido: ' + rows[i].valor.tag_brinco
                                }

                                rows[i].created = Moment(rows[i].created).format('DD/MM/YYYY HH:mm');

                                if (typeof rows[i].valor.status !== 'undefined') {

                                    if (rows[i].valor.status.match(/Falha.*/)) {
                                        rows[i].status_notificacao = 'danger'
                                    } else if (rows[i].valor.status.match(/Sucesso.*/)) {
                                        rows[i].status_notificacao = 'success'
                                    } else {
                                        rows[i].status_notificacao = 'info'
                                    }
                                }

                            }
                                res.status(200).send(rows);
                        } else {
                            res.status(200).send([]);
                            //connection.release();
                        }
                    }

                });
        });

    });
/**************
    MARCA AS NOTIFICAÇÕES COMO LIDA
* ************* */

Router.route('/lida/:id')
    .put(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_notificacoes SET lida = 1, visualizada = 1 WHERE id = ${req.params.id}`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(500).send({ message: 'error' });
                    }
                    else {
                        res.status(200).send({ message: 'A notificação foi marcada como lida.' })
                    }
                    connection.release();
                })
        });
    });
/**************
    MARCA TODAS NOTIFICAÇÕES COMO LIDA
* ************* */
Router.route('/marcar/lida/todas')
    .put(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_notificacoes SET lida = 1, visualizada = 1  WHERE  lida = 0`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(500).send({ message: 'error: ' + error.message });
                    }
                    else {
                        res.status(200).send({ message: 'As notificações foram marcadas como lida.' });
                    }
                    connection.release();
                });
        });
    });
/**************
    MARCA CADA NOTIFICAÇÃO COMO VISUALIZADA
* ************* */

Router.route('/visualizar/:id')
    .put(function (req, res, next) {
        poolQuery.getConnection(function (err, connect) {
            connect.query(`UPDATE tb_notificacoes SET visualizada = 1 WHERE id = ${req.params.id}`, function (error, rows, fields) {                
                if (error) {
                    res.status(500).send({ message: 'error' })
                }
                else {
                    res.status(200).send({ message: 'Notificação foi marcada como visualizada.' })
                }
                connect.release();
            });
        });
    });

/**************
    MARCA TODAS NOTIFICAÇÕES COMO VISUALIZADA
* ************* */




Router.route('/filtro/visualizar')
    /**************
       BUSCA AS NOTIFICAÇÕES AINDA NÃO LIDAS E NEM VISUALIZADAS  
    * ************* */
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            let ids = [];
            connection.query(`SELECT * FROM tb_notificacoes 
                              WHERE excluido <> 1  AND tb_notificacoes_tipos_id IN('2','4','5','6','7','9','11','13','20', '21', '22') 
                              AND lida = 0 AND visualizada = 0 ORDER BY id DESC`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {

                            for (i = 0; i < rows.length; i++) {
                                if (rows[i].st_toast == 0) {
                                    ids.push(rows[i].id);
                                }

                                rows[i].valor = JSON.parse(rows[i].valor);
                                if (!rows[i].valor.estado) {
                                    rows[i].valor.estado = 'Novo'
                                }

                                //CODIGOS TIPO NOTIFICACOES
                                switch (rows[i].tb_notificacoes_tipos_id) {
                                    case 2:
                                        rows[i].tipo = 'Novo Dosador';
                                        break;

                                    case 4:
                                        rows[i].tipo = 'Configuração do Dosador';
                                        break;

                                    case 5:
                                        rows[i].tipo = `Brinco Desconhecido: ${rows[i].valor.tag_brinco}`;
                                        break;

                                    case 7:
                                        rows[i].tipo = 'Notificação de Reset de Dosador';
                                        break;

                                    case 9:
                                        rows[i].tipo = 'Notificação de Atualização de Receita';
                                        break;

                                    case 11:
                                        rows[i].tipo = 'Notificação de Atualização de Animais';
                                        break;

                                    case 13:
                                        rows[i].tipo = 'Notificação de Atualização de Parametros do Dosador';
                                        break;

                                    case 16:
                                        rows[i].tipo = "Notificação de Alteração de Status da Ração";
                                        break;

                                    case 17:
                                        rows[i].tipo = "Notificação de Alteração de Status do Motor";
                                        break;

                                    case 18:
                                        rows[i].tipo = "Notificação de Alteração de Status da Antena";
                                        break;

                                    case 19:
                                        rows[i].tipo = "Notificação de Alteração de Status do Dosador";
                                        break;

                                    case 20:
                                        rows[i].tipo = "ATENÇÃO, O SISTEMA FOI RENICIADO!";
                                        break;

                                    case 21:
                                        rows[i].tipo = "ATENÇÃO, HOUVE UM ERRO AO REALIZAR O BACKUP DIÁRIO, CONTATE O SUPORTE!";
                                        break;

                                    case 22:
                                        rows[i].tipo = "BACKUP DIÁRIO REALIZADO COM SUCESSO!";
                                }


                                if (rows[i].valor.estado) {
                                    rows[i].valor.estado
                                }
                                if (rows[i].valor.tag_brinco) {
                                    rows[i].valor.estado = 'Brinco desconhecido: ' + rows[i].valor.tag_brinco
                                }

                                rows[i].created = Moment(rows[i].created).format('DD/MM/YYYY HH:mm');

                                if (typeof rows[i].valor.status !== 'undefined') {

                                    if (rows[i].valor.status.match(/Falha.*/)) {
                                        rows[i].status_notificacao = 'danger'
                                    } else if (rows[i].valor.status.match(/Sucesso.*/)) {
                                        rows[i].status_notificacao = 'success'
                                    } else {
                                        rows[i].status_notificacao = 'info'
                                    }
                                }

                            }

                            setTimeout(function () {

                                if (ids.length > 0) {
                                    var sqlUpdate = `UPDATE tb_notificacoes SET st_toast = 1 WHERE id in (${ids})`;

                                    connection.query(sqlUpdate,
                                        function (error1, rows1, fields1) {                                           
                                            if (error) {
                                                
                                                console.log('[ERROR] -> In update set st_toast');
                                                //res.status(400).send({ message: error.message }); 
                                            } else {
                                                
                                                console.log('[SUCCESS] -> In update set st_toast');
                                                //connection.release();
                                            }
                                            connection.release();
                                        });
                                }else {
                                    connection.release();
                                }
                            }, 5000);
                                res.status(200).send(rows);
                        } else {
                            res.status(200).send([]);
                            connection.release();
                        }
                    }
                    //connection.release();
                });
        });

    })
    /**************
       SET TODAS AS NOTIFICACOES COMO VISUALIZADAS 
    * ************* */
    .put(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_notificacoes SET visualizada = 1, lida = 1 WHERE visualizada = 0`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(500).send({ message: 'error' });
                    }
                    else {
                        res.status(200).send({ message: 'Todas as notificações foram marcadas como visualizadas.' });
                    }
                    connection.release();
                })
        })
    })

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;