/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    bcrypt = require('bcrypt-nodejs'),
    Router = express.Router(),
    salt = bcrypt.genSaltSync(10),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    utilDB = require('../utils/utilDB');

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
        var paginate = utilDB.paginate(req, res, next);

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_usuarios.*, (SELECT count(*) FROM tb_usuarios WHERE excluido <> 1) as COUNT_LINHA 
                              FROM tb_usuarios as tb_usuarios WHERE excluido <> 1 ORDER BY id DESC` + paginate,
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
            nome: req.body.nome,
            email: req.body.email,
            senha: bcrypt.hashSync(req.body.senha),
            tb_granja_id: req.body.granja_id,
            tb_acl_grupos_id: req.body.grupo_id,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_usuarios WHERE excluido <> 1 AND email = '${CAMPOS.email}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message, erro: true });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: `O usuário ${CAMPOS.email} já foi cadastrado!`, erro: true });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_usuarios SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message, erro: true }) }
                                    else { res.status(200).send({ message: `O usuário ${CAMPOS.email} foi cadastrado com sucesso!`, erro: false }) }

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
            connection.query(`SELECT * FROM tb_usuarios WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O usuário pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            email: req.body.email,
            tb_granja_id: req.body.granja_id,
            tb_acl_grupos_id: req.body.grupo_id,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_usuarios WHERE email = '${CAMPOS.email}' AND id != ${req.params.id} AND excluido = 0`,
                function (error1, rows1, fields1) {
                    if (error1) {
                        res.status(400).send({ message: error1.message, erro: true });
                        connection.release();
                    }
                    else {
                        if (rows1.length >= 1) {
                            res.status(200).send({ message: `O usuário ${CAMPOS.email} já foi cadastrado!`, erro: true });
                            connection.release();
                        }
                        else {
                            connection.query(`UPDATE tb_usuarios SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message, erro: true }) }
                                    else { res.status(200).send({ message: `Os dados do usuário foram atualizados com sucesso!`, erro: false }) }

                                });
                        }

                    }


                });

        })
    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_usuarios SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O usuário foi excluído com sucesso!` }) }

                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID) - RESETA SENHA
******************************************************************************************/
Router.route('/reseta-senha/:id')

    //SELECIONA
    .get(function (req, res, next) {

        var senha = bcrypt.hashSync('123456');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_usuarios SET senha = ?, last_login = null, esqueceu_senha = 0 WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`, [senha],
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        res.status(200).send({ message: `A senha do usuário foi resetada com sucesso!` })
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
            connection.query(`SELECT id, nome FROM tb_usuarios WHERE excluido <> 1`,
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
ROTA - CARREGA COMBO RESET SENHA 
******************************************************************************************/
Router.route('/extra/combo/reset')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, nome, email, esqueceu_senha FROM tb_usuarios WHERE excluido <> 1 ORDER BY esqueceu_senha = 1 DESC`,
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
