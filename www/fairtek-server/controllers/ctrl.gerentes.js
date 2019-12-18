/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express');
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
            connection.query(`SELECT tb_gerentes.*, (SELECT count(*) FROM tb_gerentes WHERE excluido <> 1) as COUNT_LINHA FROM tb_gerentes
                              WHERE excluido <> 1 ORDER BY id DESC` + paginate,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(utilDB.construirObjetoRetornoBD(rows)) }
                        else { res.status(400).send({ message: `Não existem gerentes a serem exibidos!` }) }
                    }

                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {
        // var UPPER = {
        //     nome : req.body.nome,
        //     email : req.body.email
        // }

        // UPPER = JSON.stringify(UPPER).toUpperCase();
        
        // UPPER = JSON.parse(UPPER);
        


        var CAMPOS = {
            nome: req.body.nome,
            email: req.body.email,
            cpf: req.body.cpf,
            telefone: req.body.telefone,
            //codigo: req.body.codigo,
            ativo: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_gerentes 
                              WHERE excluido <> 1 AND (email = '${CAMPOS.email}' OR cpf = '${CAMPOS.cpf}') LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({message: 'erro'});
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_gerentes SET ?`, CAMPOS,

                                function (error, results, fields) {

                                    connection.release();

                                    if (error) {res.status(400).send({ message: error.message })}
                                    else { res.status(200).send({ message: `O gerente ${CAMPOS.nome} foi cadastrado com sucesso!` }) }

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
            connection.query(`SELECT * FROM tb_gerentes WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O gerente pesquisado não existe!` }) }
                    }

                });
        });

    })
    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            email: req.body.email,
            cpf: req.body.cpf,
            telefone: req.body.telefone,
            //codigo: req.body.codigo,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_gerentes 
                              WHERE excluido <> 1 AND (email = '${CAMPOS.email}' OR cpf = '${CAMPOS.cpf}') `,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 1) {
                            res.status(200).send({message: 'erro'});
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {
                            connection.query(`UPDATE tb_gerentes SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `Os dados do gerente ${CAMPOS.nome} foram atualizados com sucesso!` }) }

                                }
                            );
                        }
                    }

                });
        });


        poolQuery.getConnection(function (err, connection) {


        });

    })

    // //ATUALIZA
    // .put(function (req, res, next) {

    //     var CAMPOS = {
    //         nome: req.body.nome,
    //         email: req.body.email,
    //         cpf: req.body.cpf,
    //         telefone: req.body.telefone,
    //         codigo: req.body.codigo,
    //         ativo: req.body.ativo,
    //         updated: Moment().format('YYYY-MM-DD HH:mm:ss')
    //     };

    //     poolQuery.getConnection(function (err, connection) {

    //         connection.query(`UPDATE tb_gerentes SET ? WHERE id = ${req.params.id}`, CAMPOS,
    //             function (error, results, fields) {
    //                 connection.release();

    //                 if (error) { res.status(400).send({ message: error.message }) }
    //                 else { res.status(200).send({ message: `Os dados do gerente ${CAMPOS.nome} foram atualizados com sucesso!` }) }

    //             });
    //     });

    // })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_gerentes SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O gerente foi excluído com sucesso!` }) }

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
            connection.query(`SELECT id, nome FROM tb_gerentes WHERE excluido <> 1`,
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
