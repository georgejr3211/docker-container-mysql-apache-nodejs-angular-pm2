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
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {

        var paginate = utilDB.paginate(req, res, next);

        poolQuery.getConnection(function (err, connection) {
            //     connection.query(`SELECT DOSADORES.id, DOSADORES.tb_baias_id, DOSADORES.codigo,
            // DOSADORES.ativo, DOSADORES.ativo_rede, PARAMETROS.tb_dosadores_id,
            // PARAMETROS.pTi, PARAMETROS.pTd, PARAMETROS.pTa, PARAMETROS.pTp,
            // PARAMETROS.pTr, PARAMETROS.pTs, PARAMETROS.pTar, (SELECT count(*) FROM tb_dosadores WHERE excluido <> 1) as COUNT_LINHA
            // FROM tb_dosadores as DOSADORES INNER JOIN tb_eventos_parametros as PARAMETROS
            // ON DOSADORES.id = PARAMETROS.tb_dosadores_id
            // WHERE DOSADORES.excluido <> 1 `+ paginate,
            connection.query(`SELECT DOSADORES.id, DOSADORES.tb_baias_id, DOSADORES.codigo, DOSADORES.ativo, DOSADORES.ativo_rede, PARAMETROS.tb_dosadores_id,
                                PARAMETROS.pTi, PARAMETROS.pTa, PARAMETROS.pTp, PARAMETROS.pTr, PARAMETROS.pTs, PARAMETROS.pTar, tb_baias.nome as nome_baia,
                                (SELECT count(*) FROM tb_dosadores WHERE excluido <> 1) as COUNT_LINHA
                              FROM tb_dosadores as DOSADORES 
                                LEFT JOIN tb_eventos_parametros as PARAMETROS
                                    ON DOSADORES.id = PARAMETROS.tb_dosadores_id
                                LEFT JOIN 
                                    tb_baias AS tb_baias ON DOSADORES.tb_baias_id = tb_baias.id
                              WHERE DOSADORES.excluido <> 1 ORDER BY DOSADORES.id DESC` + paginate,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(utilDB.construirObjetoRetornoBD(rows))
                        } else {
                            res.status(200).send([])
                        }
                    }

                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            tb_baias_id: req.body.baias_id,
            codigo: req.body.codigo,
            ativo: req.body.ativo,
            ativo_rede: req.body.ativo_rede,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_dosadores 
                              WHERE excluido <> 1 AND tb_baias_id = '${CAMPOS.tb_baias_id}' AND codigo = '${CAMPOS.codigo}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(400).send({
                                message: `O dosador já foi cadastrado!`
                            });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_dosadores SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `O dosador foi cadastrado com sucesso!`
                                        })
                                    }

                                });

                        }
                    }

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
            connection.query(`SELECT * FROM tb_dosadores 
                              WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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
                                message: `O dosador pesquisado não existe!`
                            })
                        }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            tb_baias_id: req.body.baias_id,
            codigo: req.body.codigo,
            ativo: req.body.ativo,
            ativo_rede: req.body.ativo_rede,
            ag_update: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_dosadores SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {

                        //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
                        var CAMPOS_NOTIFICACAO = {
                            tb_notificacoes_tipos_id: 3,
                            valor: `{"mac":"${req.body.codigo}"}`,
                            created: Moment().format('YYYY-MM-DD HH:mm:ss')
                        };
                        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                            function (error, results, fields) {
                                connection.release();

                                if (error) {
                                    res.status(400).send({
                                        message: error.message
                                    })
                                } else {
                                    res.status(200).send({
                                        message: `Sua solicitação foi enviada com sucesso!`
                                    })

                                }

                            })
                    }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        var CAMPOS = {
            excluido: 1,
            ativo: 0,
            ag_update: 0,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_dosadores SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {

                        connection.query(`SELECT codigo FROM tb_dosadores where id = ${req.params.id}`,
                            function (error, results, fields) {

                                if (error) {
                                    res.status(400).send({
                                        message: error.message
                                    });
                                    connection.release();
                                } else {
                                    RESULT_CODIGO = results[0].codigo
                                    //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
                                    var CAMPOS_NOTIFICACAO = {
                                        tb_notificacoes_tipos_id: 6,
                                        valor: `{"mac": "${RESULT_CODIGO}"}`,
                                        created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                    };

                                    connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                        function (error, results, fields) {
                                            connection.release();

                                            if (error) {
                                                res.status(400).send({
                                                    message: error.message
                                                })
                                            } else {
                                                res.status(200).send({
                                                    message: `O dosador foi excluído com sucesso!`
                                                })

                                            }

                                        })
                                }
                            });
                    }

                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA PARAMETROS
******************************************************************************************/
Router.route('/getid/:id/parametros/edit')

    //SELECIONA
    .put(function (req, res, next) {

        var CAMPOS = {
            ag_update: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        var RESULT_CODIGO;

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_dosadores SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {

                        //ATUALIZANDO TABELA DE PARAMETROS
                        var CAMPOS_PARAMETROS = {
                            pTi: req.body.pTi * 1000,
                            pTa: req.body.pTa * 1000,
                            pTp: req.body.pTp * 1000,
                            pTr: req.body.pTr * 1000,
                            pTs: req.body.pTs * 1000,
                            pTar: req.body.pTar * 1000
                        };

                        connection.query(`SELECT tb_dosadores_id FROM tb_eventos_parametros 
                                          WHERE tb_dosadores_id = ${req.params.id}`,
                            function (error, results, fields) {

                                if (error) {
                                    res.status(400).send({
                                        message: error.message
                                    });
                                    connection.release();
                                } else {

                                    if (results[0] != null) {

                                        connection.query(`UPDATE tb_eventos_parametros SET ? WHERE tb_dosadores_id = ${req.params.id}`, CAMPOS_PARAMETROS,
                                            function (error, results, fields) {

                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                    connection.release();
                                                } else {
                                                    connection.query(`SELECT codigo FROM tb_dosadores WHERE id = ${req.params.id}`,
                                                        function (error, results, fields) {

                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            } else {
                                                                RESULT_CODIGO = results[0].codigo
                                                                //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
                                                                var CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 12,
                                                                    valor: `{"mac": "${RESULT_CODIGO}"}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, results, fields) {
                                                                        connection.release();

                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            })
                                                                        } else {
                                                                            res.status(200).send({
                                                                                message: `Sua solicitação foi enviada com sucesso!`
                                                                            })

                                                                        }

                                                                    })
                                                            }
                                                        });
                                                }



                                            })
                                    } else {


                                        var CAMPO_DOSADOR = {
                                            tb_dosadores_id: req.params.id
                                        }
                                        connection.query(`INSERT INTO tb_eventos_parametros SET ?, ?`, [CAMPOS_PARAMETROS, CAMPO_DOSADOR],
                                            function (error, results, fields) {

                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                    connection.release();
                                                } else {
                                                    connection.query(`SELECT codigo FROM tb_dosadores WHERE id = ${req.params.id}`,
                                                        function (error, results, fields) {

                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            } else {
                                                                RESULT_CODIGO = results[0].codigo
                                                                //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
                                                                var CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 12,
                                                                    valor: `{"mac": "${RESULT_CODIGO}"}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, results, fields) {
                                                                        connection.release();

                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            })
                                                                        } else {
                                                                            res.status(200).send({
                                                                                message: `Sua solicitação foi enviada com sucesso!`
                                                                            })

                                                                        }

                                                                    })
                                                            }
                                                        });
                                                }


                                            })

                                    }

                                }
                            })
                    }

                });
        });
    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, codigo FROM tb_dosadores WHERE excluido <> 1`,
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
                            res.status(200).send([])
                        }
                    }

                });
        });

    })


/******************************************************************************************
ROTA ITENS (TB_BAIAS_ID)
Retorna dosadores e dados de suas baias
******************************************************************************************/
Router.route('/baia/:id')

    //LISTA POR TB_BAIAS_ID
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_dosadores WHERE excluido <> 1 AND ativo_rede = 1 AND ativo = 1 AND tb_baias_id = ${req.params.id}`,
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
                            res.status(200).send([])
                        }
                    }

                });
        });

    })


/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/baias/count')

    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(dosadores.id) as dosadores, baia.nome 
            FROM tb_dosadores as dosadores
            LEFT JOIN tb_baias as baia 
                ON dosadores.tb_baias_id = baia.id
            WHERE dosadores.ativo = 1 AND dosadores.excluido = 0
            GROUP BY baia.nome`,
                function (error, rows, fields) {
                    if (error) {
                        connection.release()
                        res.status(400).send({
                            message: error.message
                        })
                    } res.status(200).send(rows)
                });
        });

    })

    Router.route('/baias/relatorio/alimentacao/:dataFilter')
        .get(function(req, res, next){
            let data = req.params.dataFilter;
            poolQuery.getConnection(function (err, connection) {
                connection.query(`select
                                    tbb.nome AS baia,
                                    tbd.codigo as dosador,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = '${data}' and tba2.ult_dosador = tbd.id)/10 as d, 
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 1 DAY) and tba2.ult_dosador = tbd.id)/10 as d1,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 2 DAY) and tba2.ult_dosador = tbd.id)/10 as d2,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 3 DAY) and tba2.ult_dosador = tbd.id)/10 as d3,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 4 DAY) and tba2.ult_dosador = tbd.id)/10 as d4,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 5 DAY) and tba2.ult_dosador = tbd.id)/10 as d5,
                                    (select sum(tba2.qa) from tb_animais_registros tba2  where tba2.dosador_data = DATE_SUB('${data}', INTERVAL 6 DAY) and tba2.ult_dosador = tbd.id)/10 as d6
                                from tb_dosadores tbd
                                inner join tb_animais_registros tba on tba.ult_dosador = tbd.id
                                inner join tb_baias tbb on tbb.id = tbd.tb_baias_id
                                where 
                                    dosador_data >= DATE_SUB(${data}, INTERVAL 6 DAY) and tbd.ativo = 1
                            GROUP BY tbd.codigo, tbb.id`,
                    function (error, rows, fields) {
                        connection.release()
                        if (error) {
                            return res.status(400).send({
                                message: error.message
                            })
                        } 
                        res.status(200).send(rows)
                    });
            });
        });

/******************************************************************************************
ROTA ITEM (ID) - CALIBRAÇÃO | ATUALIZA PARAMETROS DOS DOSADORES
******************************************************************************************/
Router.route('/calibra/:pta/:idBaia')
    //ATUALIZA
    .put(function (req, res, next) {
        console.log(req.params.idBaia);
        let dosadores;
        var CAMPOS_UPDATE = {
            ag_update: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        var CAMPOS = {
            pTa: req.params.pta
        };

        //UPDATE NO CAMPO ag_update da tabela tb_dosadores, para que o agente reconheça as atualizaçoẽs
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id FROM tb_dosadores WHERE tb_baias_id = ?`, req.params.idBaia,
                (error, result) => {
                    console.log('DOSADORESSSSSS', result);
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {

                        let dosadores = result[0].id;
                        let forLoop = result.length;
                        for (let i = 0; i < forLoop; i++) {
                            if (i > 0) {
                                dosadores += `, ${result[i].id}`;
                            }
                        }
                        res.status(200).send(result[0]);
                        connection.query(`UPDATE tb_dosadores SET ? WHERE id IN (${dosadores})`, [CAMPOS_UPDATE],
                            function (error, results, fields) {
                                console.log("::::PASSOU 01::::")
                                if (error) {
                                    console.log('ERRO AO ATUALIZAR tb_dosadores', error, dosadores);
                                    res.status(400).send({
                                        message: error.message
                                    });
                                    connection.release();
                                } else {
                                    //ATUALIZA A TABELA DE PARAMETROS PARA QUE TODOS OS DOSADORES, INCLUINDO OS DESATIVADOS, RECEBAM O NOVO VALOR DE ABERTURA(pta)
                                    connection.query(`UPDATE tb_eventos_parametros SET pTa = ? WHERE tb_dosadores_id IN (${dosadores})`, [CAMPOS.pTa, dosadores],
                                        function (error, results, fields) {
                                            console.log("::::PASSOU 02::::")

                                            if (error) {
                                                console.log('ERRO AO ATUALIZAR tb_eventos_parametros', error, dosadores);
                                                res.status(400).send({
                                                    message: error.message
                                                });
                                                connection.release();
                                            } else {
                                                //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
                                                var CAMPOS_NOTIFICACAO = {
                                                    tb_notificacoes_tipos_id: 12, // Requisita a atualização dos tempos dos dosadores
                                                    valor: `{}`,
                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                };
                                                console.log('CAMPOS NOTIFICACAO', CAMPOS_NOTIFICACAO);
                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                    function (error, results, fields) {
                                                        console.log("::::PASSOU 03::::")
                                                        if (error) {
                                                            connection.release();
                                                            console.log(error);
                                                            res.status(400).send({
                                                                message: error.message
                                                            });
                                                        } else {
                                                            connection.release();
                                                            res.status(200).send();
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                    }
                });
        });


    })


/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;