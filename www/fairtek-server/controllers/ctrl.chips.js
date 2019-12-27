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
            connection.query(`SELECT tb_chips.*, (SELECT count(*) FROM tb_chips WHERE excluido <> 1) as COUNT_LINHA FROM tb_chips as tb_chips WHERE excluido <> 1 ORDER BY id DESC` + paginate,
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

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            chip: req.body.chip,
            //dt_at: req.body.dt_at,
            ativo: req.body.ativo,
            excluido: 0,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE O CHIP JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_chips WHERE excluido <> 1
        AND chip = '${CAMPOS.chip}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(500).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_chips SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();
                                    if (error) { res.status(500).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `O chip ${CAMPOS.chip} foi cadastrado com sucesso!`, chip_id: results.insertId }) }

                                });

                        }
                    }

                });
        });

    });
/******************************************************************************************
ROTA ITEM DESATIVA (ID)
******************************************************************************************/
Router.route('/desativar/:id')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, chip, dt_at, created, updated, dt_de FROM tb_chips WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O chip pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            chip: req.body.chip,
            dt_de: req.body.dt_de,
            ativo: 0,
            excluido: 1
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_chips SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O chip ${CAMPOS.chip} foi desativado!` }) }

                });
        });

    })


/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, chip, dt_at, created, updated FROM tb_chips WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O chip pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            chip: req.body.chip,
            //dt_at: req.body.dt_at,
            //ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_chips WHERE excluido <> 1
            AND chip = '${req.body.chip}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        }
                        else {
                            connection.query(`UPDATE tb_chips SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `Os dados do chip ${CAMPOS.chip} foram atualizados com sucesso!` }) }


                                });
                        }
                    }
                });
        })
    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_chips SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O chip foi desativado com sucesso!` }) }

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
            connection.query(`SELECT tb_chips.id, tb_chips.chip FROM tb_chips WHERE excluido <> 1 and ativo <> 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(200).send([]) }
                    }

                });
        });

    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo/editar')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_chips.id, tb_chips.chip FROM tb_chips WHERE excluido <> 1 and ativo <> 0`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                         res.status(400).send({ message: error.message })
                    }
                    else {
                        if (rows.length > 0) {
                            
                             res.status(200).send(rows)
                        }
                        else {
                             res.status(200).send([])
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA VALOR DO CHIP
******************************************************************************************/
Router.route('/value/chip/:id')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT chip FROM tb_chips WHERE excluido <> 1 AND ativo <> 1 AND id = ${req.params.id}`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send(rows) 
                           
                            
                        }
                    }

                });
        });

    })

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;