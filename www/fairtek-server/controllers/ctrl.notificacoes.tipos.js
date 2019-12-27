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

/*
DESTINO: AGE / FRO

TIPOS NOTIFICAÇÃO

NOME                    TIPO                DESTINO             COD
NOVO SENSOR             NOT                 FRO                 NSNOT
HABILITAR SENSOR        REQ                 AGE                 HSREQ
HABILITAR SENSOR        RES                 FRO                 HSRES

ATUALIZAR TABELA DIETA  REQ                 AGE                 ATDREQ
ATUALIZAR TABELA DIETA  RES                 FRO                 ATDRES

ATUALIZAR DIETA ANIMAL  NOT                 AGE/FRO             ADANOT

NOVO ANIMAL             NOT                 FRO                 NANOT
HABITILIAR ANIMAL       REQ                 AGE                 HANREQ
HABILITAR ANIMAL        RES                 FRO                 HANRES

ANIMAL SEM ALIMENTAR    NOT                 FRO                 ASANOT

GENERICO                NOT                 AGE/FRO             GNRCO             
*/

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_notificacoes_tipos WHERE excluido <> 1`,
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

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            codigo: req.body.codigo,
            nome: req.body.nome,
            descricao: req.body.descricao,
            excluido: 0,
            ativo: 0
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_notificacoes_tipos WHERE excluido <> 1
                              AND codigo = '${CAMPOS.codigo}' AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: `O tipo de notificação ${CAMPOS.nome} já foi cadastrado!` });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_notificacoes_tipos SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `O tipo de notificação ${CAMPOS.nome} foi cadastrado com sucesso!` }) }

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
            connection.query(`SELECT * FROM tb_notificacoes_tipos WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            codigo: req.body.codigo,
            nome: req.body.nome,
            descricao: req.body.descricao
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_notificacoes_tipos SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `Os dados do tipo de notificação foram atualizadas com sucesso!` }) }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_notificacoes_tipos SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O tipo de notificação foi excluído com sucesso!` }) }

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
            connection.query(`SELECT id, nome FROM tb_notificacoes_tipos WHERE excluido <> 1`,
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