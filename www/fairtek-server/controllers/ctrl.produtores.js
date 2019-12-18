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
var utilDB = require('../utils/utilDB');

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {

        var paginate = utilDB.paginate(req, res, next);

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_produtores.*, (SELECT count(*) FROM tb_produtores WHERE excluido <> 1) as COUNT_LINHA 
                              FROM tb_produtores as tb_produtores WHERE excluido <> 1 ORDER BY id DESC` + paginate,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(utilDB.construirObjetoRetornoBD(rows)) }
                        else { res.status(400).send({ message: `Não existem produtores a serem exibidos!` }) }
                    }

                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            cpf_cnpj: req.body.cpf_cnpj,
            email: req.body.email,
            //plano: req.body.plano,
            endereco: req.body.endereco,
            telefone: req.body.telefone,
            ativo: 1,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_produtores WHERE excluido <> 0 AND (cpf_cnpj = '${CAMPOS.cpf_cnpj}' OR email = '${CAMPOS.email}') LIMIT 1`,
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

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_produtores SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `O produtor ${CAMPOS.nome} foi cadastrado com sucesso!` }) }

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
            connection.query(`SELECT * FROM tb_produtores WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O produtor pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            cpf_cnpj: req.body.cpf_cnpj,
            email: req.body.email,
            //plano: req.body.plano,
            endereco: req.body.endereco,
            telefone: req.body.telefone,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_produtores SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `Os dados do produtor ${CAMPOS.nome} foram atualizados com sucesso!` }) }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_produtores SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O produtor foi excluído com sucesso!` }) }

                });
        });

    });

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/extra/reativar')
//ATUALIZA
.put(function (req, res, next) {
    
    var CAMPOS_ATIVA = {
        ativo: 1,
        excluido: 0,
        updated: Moment().format('YYYY-MM-DD HH:mm:ss')
    };

    var CAMPOS = {
        nome: req.body.nome,
        cpf_cnpj: req.body.cpf_cnpj,
        email: req.body.email
    }

    poolQuery.getConnection(function (err, connection) {

        connection.query(`UPDATE tb_produtores SET ? WHERE cpf_cnpj like ? OR email like ?`, [CAMPOS_ATIVA, CAMPOS.cpf_cnpj, CAMPOS.email],
            function (error, results, fields) {
                connection.release();
                if (error) { res.status(400).send({
                     message: error.message 
                    }) 
                }
                else { res.status(200).send({ message: `O produtor ${CAMPOS.nome} foi reativado com sucesso!` }) }

            });
    });

})


/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO REATIVAR
******************************************************************************************/
Router.route('/extra/combo/:email/:cpf_cnpj')

    //SELECIONA
    .get(function (req, res, next) {
        
        //VERIFICA SE É CPF OU CNPJ E TROCA "_" POR "/" CASO SEJA VERDADE
        var cpf_cnpj = req.params.cpf_cnpj

        if (req.params.cpf_cnpj.length > 15){
            cpf_cnpj = req.params.cpf_cnpj.replace("_", "/")
        }

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_produtores 
                              WHERE excluido <> 0 AND (email LIKE '${req.params.email}' OR cpf_cnpj LIKE '${cpf_cnpj}')`,
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
Router.route('/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, nome FROM tb_produtores WHERE excluido <> 1`,
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
