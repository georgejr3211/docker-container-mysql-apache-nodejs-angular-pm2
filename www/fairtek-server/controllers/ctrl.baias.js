/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/

var express = require('express');
var Moment = require('../utils/moment'),
    Router = express.Router(),
    _ = require('underscore'),
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
            connection.query(`SELECT tb_baias.*, tb_galpoes.nome as nome_galpao, tb_granjas_id
            FROM tb_baias as tb_baias 
                LEFT JOIN tb_galpoes as tb_galpoes on tb_baias.tb_galpoes_id = tb_galpoes.id
                LEFT JOIN tb_granjas as tb_granjas on tb_galpoes.tb_granjas_id = tb_granjas.id
            WHERE  tb_galpoes.ativo <> 0 AND tb_granjas.ativo <> 0 AND tb_baias.excluido <> 1 ORDER BY tb_baias.id DESC`
                + paginate,

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
            tb_galpoes_id: req.body.galpoes_id,
            nome: req.body.nome,
            //codigo: req.body.codigo,
            capacidade: req.body.capacidade,
            total: req.body.total,
            //espaco: req.body.espaco,
            //sugerido: req.body.sugerido,
            femea: req.body.femea,
            //tamanho: req.body.tamanho,
            //largura: req.body.largura,
            //comprimento: req.body.comprimento,
            tb_setor_tipo_id: 2,
            ativo: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE A BAIA FOI CADASTRADA
            connection.query(`SELECT * FROM tb_baias WHERE excluido <> 1
        AND tb_galpoes_id = '${CAMPOS.tb_galpoes_id}' AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send({
                                message: 'erro'
                            });
                            connection.release();
                        }

                        //EXECUTA CADASTRO DA BAIA
                        else {
                            connection.query(`INSERT INTO tb_baias SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                        connection.release();
                                    } else {
                                        //SELECIONA O ID DA ULTIMA BAIA INSERIDA
                                        connection.query(`SELECT MAX(id) AS id FROM tb_baias`,
                                            function (error, results1, fields) {
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    })
                                                    connection.release();
                                                } else {
                                                    let id_baia = results1[0].id;
                                                    let id_rede = 1;
                                                    let query = `INSERT INTO tb_rede(status, id_rede, id_baia) VALUES (0, ${id_rede}, ${id_baia})`;
                                                    for (let i = 1; i < 200; i += 1) {
                                                        id_rede += i;
                                                        query = query.concat(`, (0, ${id_rede}, ${id_baia})`);
                                                        id_rede -= i;
                                                    }
                                                    //INSERE 200 LINHAS NA TB_REDE
                                                    connection.query(query,
                                                        function (error, results, fields) {
                                                            connection.release();
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                })
                                                            } else {
                                                                res.status(200).send({
                                                                    message: `A baia ${CAMPOS.nome} foi cadastrada com sucesso!`
                                                                })
                                                            }
                                                        })
                                                }
                                            }
                                        )
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
            connection.query(`SELECT * FROM tb_baias WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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
                                message: `A baia pesquisada não existe!`
                            })
                        }
                    }
                });
        });
    })

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            id: req.body.id_baia,
            tb_galpoes_id: req.body.galpoes_id,
            nome: req.body.nome,
            capacidade: req.body.capacidade,
            total: req.body.total,
            femea: req.body.femea,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        console.log("body: ", req.body)

        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE A BAIA FOI CADASTRADA
            connection.query(`SELECT * FROM tb_baias WHERE 
            excluido <> 1 AND id <> ? AND tb_galpoes_id = ? AND nome = ? LIMIT 1`, [CAMPOS.id, CAMPOS.tb_galpoes_id, CAMPOS.nome],
                function (error, rows, fields) {
                    if (error) {
                        console.log("entrou aqui", error);
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            console.log("entrou aqui", rows);

                            res.status(200).send({
                                message: 'erro'
                            });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {
                            console.log("else: ", rows);

                            connection.query(`UPDATE tb_baias SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();
                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `Os dados da baia ${CAMPOS.nome} foram atualizados com sucesso!`
                                        })
                                    }

                                });
                        }
                    }
                });
        })

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_baias SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `A baia foi excluída com sucesso!`
                        })
                    }

                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO POR SETOR
******************************************************************************************/
Router.route('/extra/combo/setor/:setorId')
    //SELECIONA
    .get((req, res, next) => {
        console.log('SETOR ID', req.params.setorId);
        poolQuery.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.status(400).send({
                    message: err
                });
            } else {
                connection.query(`SELECT tb_baias.id, tb_baias.nome FROM tb_baias as tb_baias WHERE tb_setor_tipo_id = ${req.params.setorId} AND excluido <> 1 AND ativo <> 0`,
                    (error, rows, fields) => {
                        connection.release();
                        if (error) {
                            res.status(400).send({
                                message: error
                            });
                        } else {
                            if (rows.length > 0) {
                                res.status(200).send(rows)
                            } else {
                                res.status(200).send([]);
                            }
                        }
                    });
            }
        });
    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')
    //SELECIONA
    .get((req, res, next) => {
        poolQuery.getConnection((err, connection) => {
            connection.query(`SELECT tb_baias.id, tb_baias.nome FROM tb_baias as tb_baias WHERE excluido <> 1 and ativo <> 0`,
                (error, rows, fields) => {
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
ROTA ITENS (TB_GALPOES_ID)
******************************************************************************************/
Router.route('/galpao/:id')

    //LISTA POR TB_GALPOES_ID
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`
            SELECT tb_dosadores.id, tb_dosadores.tb_baias_id, tb_dosadores.codigo, tb_dosadores.status_antena, 
            tb_dosadores.status_dosador, tb_dosadores.status_motor, tb_dosadores.status_racao, tb_dosadores.ativo,
            tb_baias.nome as tb_baia_nome, tb_baias.ativo as tb_baia_ativo 
            FROM tb_dosadores as tb_dosadores 
            INNER JOIN tb_baias as tb_baias on tb_baias.id = tb_dosadores.tb_baias_id WHERE tb_baias.excluido <> 1  
            AND tb_dosadores.excluido <> 1 AND tb_galpoes_id = ${req.params.id} order by tb_dosadores.tb_baias_id;`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            var baias = [];
                            var baia = {};
                            var baia_id = rows[0].tb_baias_id;
                            baia.dosadores = [];

                            for (var i = 0; i < rows.length; i++) {

                                if (baia_id !== rows[i].tb_baias_id) {

                                    baia_id = rows[i].tb_baias_id;
                                    baias.push(baia);
                                    baia = {};
                                    baia.dosadores = [];
                                }

                                baia.id = rows[i].tb_baias_id;
                                baia.nome = rows[i].tb_baia_nome;

                                var dosador = {
                                    codigo: rows[i].codigo,
                                    id: rows[i].id,
                                    status_antena: rows[i].status_antena,
                                    status_dosador: rows[i].status_dosador,
                                    status_motor: rows[i].status_motor,
                                    status_racao: rows[i].status_racao,
                                    ativo: rows[i].ativo
                                }
                                baia.dosadores.push(dosador)

                            }

                            baias.push(baia);

                            res.status(200).send(baias)
                        } else {
                            res.status(200).send([])
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/granja/extra/combo/:id')

    //LISTA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                tb_baias.*,
                                tb_galpoes.nome AS nome_galpao,
                                tb_granjas_id,
                                tb_dosadores.id as dosador_id,
                                tb_dosadores.tb_baias_id,
                                tb_dosadores.codigo,
                                tb_dosadores.status_antena,
                                tb_dosadores.status_dosador,
                                tb_dosadores.status_motor,
                                tb_dosadores.status_racao,
                                tb_dosadores.ativo
                            FROM
                                tb_baias AS tb_baias
                                    LEFT JOIN
                                tb_galpoes AS tb_galpoes ON tb_baias.tb_galpoes_id = tb_galpoes.id
                                    LEFT JOIN
                                tb_granjas AS tb_granjas ON tb_galpoes.tb_granjas_id = tb_granjas.id
                                    INNER JOIN 
                                    tb_dosadores as tb_dosadores on tb_baias.id = tb_dosadores.tb_baias_id 
                                    
                            WHERE
                                tb_granjas.id = ${req.params.id}
                                    AND tb_galpoes.ativo <> 0
                                    AND tb_granjas.ativo <> 0
                                    AND tb_baias.excluido <> 1
                                    AND tb_dosadores.excluido <> 1
                            ORDER BY tb_baias.id `,

                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {

                            var baia = []
                            var dosadores = 0;

                            //CRIA ARRAY DE BAIA TRAZENDO OS DOSADORES REFERENTE A CADA UMA.
                            for (var i = 0; i < rows.length; i++) {
                                baia[i] = { id: null, nome: '', dosadores: null };
                                baia[i].id = rows[i].id;
                                baia[i].nome = rows[i].nome;

                                baia[i].dosadores = _.filter(rows, {
                                    'tb_baias_id': rows[i].id
                                });
                            }

                            var baias = [];
                            var arrIdIndice = [];

                            for (var i = 0; i < baia.length; i++) {
                                arrIdIndice = baias.map(function (d) {
                                    return d.id;
                                })
                                if (!_.contains(arrIdIndice, rows[i].id)) {
                                    baias.push(baia[i]);
                                }
                            }
                            res.status(200).send(baias)
                        } else {
                            res.status(200).send([])
                        }
                    }

                });
        });

    })

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;