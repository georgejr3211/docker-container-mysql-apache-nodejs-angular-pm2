/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),

    /******************************************************************************************
    MONGODB
    ******************************************************************************************/
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config),
    utilDB = require('../utils/utilDB');


/******************************************************************************************
LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_dietas.*, (SELECT count(*) FROM tb_dietas WHERE excluido <> 1) as COUNT_LINHA, tb_dietas_tipos.nome as nome_tipo_dieta 
            FROM tb_dietas as tb_dietas left join tb_dietas_tipos as tb_dietas_tipos on tb_dietas.tipo_dieta = tb_dietas_tipos.id WHERE tb_dietas.excluido <> 1 AND tb_dietas.dieta_calibracao <> 1 ORDER BY id DESC ` + paginate,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(utilDB.construirObjetoRetornoBD(rows)) }
                        else { res.status(200).send([]) }
                    }

                });
        });

    })

// /******************************************************************************************
// ROTA POST OU LIST(GET)
// ******************************************************************************************/
// Router.route('/')

//     //LISTA
//     .get(function (req, res, next) {

//         var paginate = utilDB.paginate(req, res, next);

//         poolQuery.getConnection(function (err, connection) {
//             connection.query(`SELECT tb_dietas.*, (SELECT count(*) FROM tb_dietas WHERE excluido <> 1) as COUNT_LINHA FROM tb_dietas as tb_dietas WHERE excluido <> 1 ORDER BY id DESC ` + paginate,
//                 function (error, rows, fields) {
//                     connection.release();

//                     if (error) { res.status(400).send({ message: error.message }) }
//                     else {
//                         if (rows.length > 0) { res.status(200).send(utilDB.construirObjetoRetornoBD(rows)) }
//                         else { res.status(200).send([]) }
//                     }

//                 });
//         });

//     })
/******************************************************************************************
ROTA POST 
******************************************************************************************/
Router.route('/')
    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            //codigo: null, //req.body.codigo, //CAMPO NAO NECESSARIO
            qtd_dias: req.body.qtd_dias,
            ag_update: 1,
            tipo_dieta: req.body.dietas_tipos,
            ativo: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        var CONFIGS = req.body.configs;



        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE DIETA JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_dietas WHERE excluido <> 1 AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'Já existe uma dieta cadastrada com este nome.', cod:500 });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {
                            //VERIFICANDO SLOT DISPONIVEL
                            connection.query(`SELECT id FROM tb_rede_dietas WHERE status = 0 ORDER BY id ASC LIMIT 1`,
                                function (error, results, fields) {

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        });
                                        connection.release();
                                    } else {
                                        if (results.length === 0) {
                                            res.status(200).send({
                                                message: 'O número máximo de dietas foi atingido. Qualquer dúvida contate o Suporte!', cod: 500
                                            });
                                        } else {
                                            let ID_REDE = {
                                                id_rede: results[0].id
                                            };
                                           

                                            //CADASTRANDO DIETA
                                            connection.query(`INSERT INTO tb_dietas SET ?, ?`, [CAMPOS, ID_REDE],
                                                function (error, results, fields) {

                                                    if (error) {
                                                        res.status(400).send({
                                                            message: error.message
                                                        });
                                                        connection.release();
                                                    }
                                                    else {

                                                        //GERANDO DIAS CONFIGURADOS DA DIETA
                                                        let qtd_configs = CONFIGS.length;
                                                        let qtd_i = 1;

                                                        for (i = 0; i < qtd_configs; i++) {
                                                            

                                                            for (j = CONFIGS[i].inicio; j <= CONFIGS[i].final; j++) {

                                                                var CAMPOS_DIETA_DIAS = {
                                                                    tb_dietas_id: results.insertId,
                                                                    dia: j,
                                                                    qr: (CONFIGS[i].qt_racao / 100),
                                                                    qtd: CONFIGS[i].qt_racao,
                                                                    ativo: 1,
                                                                    updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };


                                                                connection.query(`INSERT INTO tb_dieta_dias SET ?`, CAMPOS_DIETA_DIAS,
                                                                    function (error, results, fields) {

                                                                        if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                                                                        else {
                                                                            qtd_i++;

                                                                            if (qtd_i == req.body.qtd_dias) {

                                                                                //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
                                                                                var CAMPOS_NOTIFICACAO = {
                                                                                    tb_notificacoes_tipos_id: 8,
                                                                                    valor: `{}`,
                                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                };
                                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                    function (error, results, fields) {
                                                                                        connection.release();


                                                                                        if (error) { res.status(400).send({ message: error.message }); }
                                                                                        else {
                                                                                            res.status(200).send({ message: `A dieta foi cadastrada com sucesso!` })

                                                                                        }

                                                                                    }
                                                                                )

                                                                            }

                                                                        }

                                                                    }
                                                                );

                                                            }

                                                        }
                                                    }

                                                });

                                            //ATUALIZAR SLOT PARA ATIVO
                                            var CAMPOS_SLOT = {
                                                status: 1
                                            };
                                            connection.query(`UPDATE tb_rede_dietas SET ? WHERE id = ${ID_REDE.id_rede} LIMIT 1`, CAMPOS_SLOT,
                                                function (error, results, fields) {

                                                    if (error) {
                                                        res.status(400).send({
                                                            message: error.message
                                                        });
                                                        connection.release();
                                                    }
                                                })
                                        }

                                    }

                                });

                        }
                    }

                });

        });

    });


// //GERANDO DIAS DA DIETA - ANTIGO
// let qtd_i = 1;
// for (i = qtd_i; i <= req.body.qtd_dias; i++) {

//     var CAMPOS_DIETA_DIAS = {
//         tb_dietas_id: results.insertId,
//         dia: i,
//         qr: i * 2,
//         qtd: 200,
//         updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
//         created: Moment().format('YYYY-MM-DD HH:mm:ss')
//     };

//      connection.query(`INSERT INTO tb_dieta_dias SET ?`, CAMPOS_DIETA_DIAS,
//          function (error, results, fields) {   

//             if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//             else {

//                 qtd_i++;

//                 if (qtd_i == req.body.qtd_dias) {

//                     //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
//                     var CAMPOS_NOTIFICACAO = {
//                         tb_notificacoes_tipos_id: 8,
//                         valor: `{}`,
//                         created: Moment().format('YYYY-MM-DD HH:mm:ss')
//                     };
//                     connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
//                         function (error, results, fields) {
//                             connection.release();

//                             if (error) { res.status(400).send({ message: error.message }) }
//                             else {
//                                 res.status(200).send({ message: `A dieta foi cadastrada com sucesso!` })

//                             }

//                         }
//                     )

//                 }

//              }

//          }
//     );
// }


/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id/:id_rede?')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_dietas WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `A dieta pesquisada não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            //codigo: req.body.codigo,
            tipo_dieta: req.body.dietas_tipos,
            ag_update: 1,
            qtd_dias: req.body.qtd_dias,
            //ativo: req.body.ativo, Não necessario 
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        var CONFIGS = req.body.configs;
        
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_dietas WHERE excluido <> 1 AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 1) {
                            res.status(200).send({ message: 'Já existe uma dieta cadastrada com este nome!', cod:500 });
                            connection.release();
                        }
                        else {
                            connection.query(`UPDATE tb_dietas SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {

                                    if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                                    else {
                                        //ATUALIZANDO DIAS CONFIGURADOS DA DIETA
                                        let qtd_configs = CONFIGS.length;
                                        let qtd_i = 1;
                                        connection.query(`UPDATE tb_dieta_dias SET ativo = 0 WHERE tb_dietas_id = ${req.params.id} AND ativo = 1`,
                                            function (error, results, fields) {

                                                if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                                                else {

                                                    for (i = 0; i < qtd_configs; i++) {
                                                        

                                                        for (j = CONFIGS[i].inicio; j <= CONFIGS[i].final; j++) {

                                                            var CAMPOS_DIETA_DIAS = {
                                                                tb_dietas_id: req.params.id, //results.insertId,
                                                                dia: j,
                                                                qr: (CONFIGS[i].qt_racao / 100),
                                                                qtd: CONFIGS[i].qt_racao,
                                                                ativo: 1,
                                                                updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                            };
                                                            connection.query(`INSERT INTO tb_dieta_dias SET ?`, CAMPOS_DIETA_DIAS,
                                                                function (error, results, fields) {

                                                                    if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                                                                    else {

                                                                        qtd_i++;
                                                                        if (qtd_i == req.body.qtd_dias) {

                                                                            //CADASTRANDO NO HISTORICO DE EDIÇÕES
                                                                            var CAMPOS_MOTIVO = {
                                                                                tb_dietas_id: req.params.id,
                                                                                motivo: req.body.motivo_ed,
                                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                            }
                                                                            connection.query(`INSERT INTO tb_dietas_historico SET ?`, CAMPOS_MOTIVO,
                                                                                function (error, results, fields) {


                                                                                    if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                                                                                    else {

                                                                                        //ATUALIZANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
                                                                                        var CAMPOS_NOTIFICACAO = {
                                                                                            tb_notificacoes_tipos_id: 8,
                                                                                            valor: `{}`,
                                                                                            created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                        };

                                                                                        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                            function (error, results, fields) {
                                                                                                connection.release();
                                                                                                if (error) { res.status(400).send({ message: error.message }) }
                                                                                                else {
                                                                                                    res.status(200).send({ message: `Os dados da dieta foram atualizados com sucesso!` })

                                                                                                }

                                                                                            }
                                                                                        );

                                                                                    }

                                                                                }
                                                                            );
                                                                        }
                                                                    }
                                                                }
                                                            );
                                                        }

                                                    }
                                                }
                                            });
                                    }
                                });
                        }
                    }
                });

        })
    })
    // //ATUALIZA
    // .put(function (req, res, next) {

    //     var CAMPOS = {
    //         nome: req.body.nome,
    //         //codigo: req.body.codigo,
    //         tipo_dieta: req.body.dietas_tipos,
    //         ag_update: 1,
    //         //ativo: req.body.ativo, Não necessario 
    //         updated: Moment().format('YYYY-MM-DD HH:mm:ss')
    //     };


    //     poolQuery.getConnection(function (err, connection) {

    //         connection.query(`UPDATE tb_dietas SET ? WHERE id = ${req.params.id}`, CAMPOS,
    //             function (error, results, fields) {

    //                 if (error) { res.status(400).send({ message: error.message }); connection.release(); }
    //                 else {

    //                     //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
    //                     var CAMPOS_NOTIFICACAO = {
    //                         tb_notificacoes_tipos_id: 8,
    //                         valor: `{}`,
    //                         created: Moment().format('YYYY-MM-DD HH:mm:ss')
    //                     };
    //                     connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
    //                         function (error, results, fields) {
    //                             connection.release();

    //                             if (error) { res.status(400).send({ message: error.message }) }
    //                             else {
    //                                 res.status(200).send({ message: `Os dados da dieta foram atualizados com sucesso!` })

    //                             }

    //                         })
    //                 }//ATUALIZANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
    // var CAMPOS_NOTIFICACAO = {
    //     tb_notificacoes_tipos_id: 8,
    //     valor: `{}`,
    //     created: Moment().format('YYYY-MM-DD HH:mm:ss')
    // };
    // connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
    //     function (error, results, fields) {
    //         connection.release();



    //             });
    //     });

    // })

    //DELETA
    .delete(function (req, res) {

        var CAMPOS = {
            excluido: 1,
            id_rede: 0,
            ativo: 0
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_dietas SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    }
                    else {
                        //ATUALIZANDO SLOT
                        var CAMPOS_SLOT = {
                            status: 0
                        };
                        connection.query(`UPDATE tb_rede_dietas SET ? WHERE id = ${req.params.id_rede}`, CAMPOS_SLOT,
                            function (error, results, fields) {

                                if (error) {
                                    res.status(400).send({
                                        message: error.message
                                    });
                                    connection.release();
                                }
                            });
                        res.status(200).send({
                            message: `A dieta foi excluída com sucesso!`
                        })
                    }

                });
        });

    });


/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_dietas.id, tb_dietas.nome FROM tb_dietas as tb_dietas WHERE excluido <> 1 and id_rede <> 0 and id <> 1 ORDER BY nome`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `Não dietas a serem exibidos!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
GET CONFIG DIETA (ID)
******************************************************************************************/
Router.route('/dieta/combo/:id')

    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_dieta_dias WHERE tb_dietas_id = ${req.params.id} AND ativo = 1 AND excluido = 0 `,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send(
                            {
                                message: error.message
                            }
                        )
                    }
                    else {

                        let config_dieta = [{
                            inicio: 0,
                            final: null,
                            qt_racao: rows[0].qtd
                        }];
                        for (var i = 1; i < rows.length; i++) {
                            if (rows[i].qtd != rows[(i - 1)].qtd) {
                                config_dieta[(config_dieta.length - 1)].final = rows[(i - 1)].dia;
                                config_dieta.push(
                                    {
                                        inicio: rows[i].dia,
                                        final: null,
                                        qt_racao: rows[i].qtd
                                    }
                                );
                            }
                        }
                        config_dieta[(config_dieta.length - 1)].final = rows[rows.length - 1].dia;
                        res.status(200).send(config_dieta);
                    }
                })
        })
    })



/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;