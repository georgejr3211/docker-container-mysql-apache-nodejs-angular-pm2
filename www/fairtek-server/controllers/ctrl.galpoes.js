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
            connection.query(`SELECT * FROM tb_galpoes WHERE excluido <> 1 ORDER BY id DESC ` + paginate,
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
            tb_granjas_id: req.body.granjas_id,
            nome: req.body.nome,
            largura: req.body.largura,
            comprimento: req.body.comprimento,
            //codigo: req.body.codigo,
            ativo: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_galpoes 
                              WHERE excluido <> 1 AND tb_granjas_id = '${CAMPOS.tb_granjas_id}' AND nome = '${CAMPOS.nome}' LIMIT 1`,
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

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_galpoes SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `O galpão ${CAMPOS.nome} foi cadastrado com sucesso!`
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
            connection.query(`SELECT * FROM tb_galpoes WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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
                                message: `O galpão pesquisado não existe!`
                            })
                        }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            tb_granjas_id: req.body.granjas_id,
            nome: req.body.nome,
            largura: req.body.largura,
            comprimento: req.body.comprimento,
            codigo: req.body.codigo,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_galpoes 
                              WHERE excluido <> 1 AND tb_granjas_id = '${CAMPOS.tb_granjas_id}' AND nome = '${CAMPOS.nome}' AND id <> ${req.params.id} LIMIT 1`,
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

                        //EXECUTA CADASTRO
                        else {
                            connection.query(`UPDATE tb_galpoes SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `Os dados do galpão ${CAMPOS.nome} foram atualizados com sucesso!`
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

            connection.query(`UPDATE tb_galpoes SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `O galpão foi excluído com sucesso!`
                        })
                    }

                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, nome FROM tb_galpoes WHERE excluido <> 1 and ativo <> 0`,
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
                                message: `Não existem galpões a serem exibidos!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA ITENS (TB_GRANJAS_ID)
******************************************************************************************/
Router.route('/granja/:id')

    //LISTA POR TB_GRANJAS_ID
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_galpoes WHERE excluido <> 1 AND tb_granjas_id = ${req.params.id}`,
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
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;