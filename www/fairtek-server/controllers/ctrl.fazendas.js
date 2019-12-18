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
            connection.query(`SELECT tb_fazendas.*, tb_produtores.nome as nome_produtor, (SELECT count(*) FROM tb_fazendas WHERE excluido <> 1) as COUNT_LINHA 
                              FROM tb_fazendas as tb_fazendas LEFT JOIN tb_produtores on tb_produtores_id = tb_produtores.id 
                              WHERE tb_fazendas.excluido <> 1 ORDER BY id DESC` + paginate,
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
            tb_produtores_id: req.body.produtores_id,
            nome: req.body.nome,
            localizacao: req.body.localizacao,
            endereco: req.body.endereco,
            email: req.body.email,
            telefone: req.body.telefone,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_fazendas 
                              WHERE excluido <> 1 AND tb_produtores_id = '${CAMPOS.tb_produtores_id}' AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(400).send({
                                message: `A fazenda ${CAMPOS.nome} já foi cadastrada!`
                            });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_fazendas SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `A fazenda ${CAMPOS.nome} foi cadastrada com sucesso!`
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
            connection.query(`SELECT * FROM tb_fazendas WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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
                                message: `A fazenda pesquisada não existe!`
                            })
                        }
                    }

                });
        });

    })
/******************************************************************************************
ROTA ITENS (PRODUTORES_ID)
******************************************************************************************/
Router.route('/produtor/:id')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_fazendas WHERE excluido <> 1 AND ativo = 1 AND tb_produtores_id = ${req.params.id}`,
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
ROTA ATUALIZA/DELETA FAZENDAS
******************************************************************************************/
Router.route('/:id')
    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            tb_produtores_id: req.body.produtores_id,
            nome: req.body.nome,
            localizacao: req.body.localizacao,
            endereco: req.body.endereco,
            email: req.body.email,
            telefone: req.body.telefone,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_fazendas SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `Os dados da fazenda ${CAMPOS.nome} foram atualizados com sucesso!`
                        })
                    }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {
        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_fazendas SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `A fazenda foi excluída com sucesso!`
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
            connection.query(`SELECT id, nome FROM tb_fazendas WHERE excluido <> 1 and ativo <> 0`,
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
                                message: `Não existem fazendas a serem exibidas!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;