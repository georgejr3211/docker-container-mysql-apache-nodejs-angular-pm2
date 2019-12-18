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
            connection.query(`SELECT tb_desativacao.*, (SELECT count(*) from tb_desativacao WHERE excluido <> 1) as COUNT_LINHA FROM tb_desativacao as tb_desativacao WHERE excluido <> 1 ` + paginate,
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
            motivo: req.body.motivo,
            excluido: 0,
            observacao: req.body.observacao,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_desativacao WHERE excluido <> 1 AND motivo = '${CAMPOS.motivo}' LIMIT 1`,
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

                            connection.query(`INSERT INTO tb_desativacao SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(500).send({ message: error.message }); }
                                    else { res.status(200).send({ message: `O motivo ${CAMPOS.motivo} foi cadastrado com sucesso!` }) }

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
            connection.query(`SELECT * FROM tb_desativacao WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O motivo pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            motivo: req.body.motivo,
            excluido:0,
            observacao: req.body.observacao,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_desativacao WHERE excluido <> 1 AND motivo = '${CAMPOS.motivo}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(500).send({ message: error.message }); console.log("1erro");
                        connection.release();
                    }
                    else {
                        if (rows.length > 1) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        }
                        else {
                            connection.query(`UPDATE tb_desativacao SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }); }
                                    else { res.status(200).send({ message: `Os dados do motivo ${CAMPOS.motivo} foram atualizados com sucesso!` }) }

                                });
                        }
                    }
                });

        })
    })

            //DELETA
            .delete(function (req, res) {

                poolQuery.getConnection(function (err, connection) {

                    connection.query(`UPDATE tb_desativacao SET excluido = 1 WHERE id = ${req.params.id}`,
                        function (error, results, fields) {
                            connection.release();

                            if (error) { res.status(400).send({ message: error.message }) }
                            else { res.status(200).send({ message: `O motivo foi excluído com sucesso!` }) }

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
                    connection.query(`SELECT id, motivo FROM tb_desativacao WHERE excluido <> 1`,
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
        POPULANDO MODULO
        ******************************************************************************************/
        module.exports = Router;
