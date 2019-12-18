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
            connection.query(`SELECT * FROM tb_dietas_tipos WHERE excluido <> 1 AND id <> 1 ORDER BY id DESC` + paginate,
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
            qtd_dias: req.body.qtd_dias,// req.body.qtd_dias,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };


        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE TIPO DA DIETA JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_dietas_tipos 
                              WHERE excluido <> 1 AND nome = '${CAMPOS.nome}' LIMIT 1`,
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
                            connection.query(`INSERT INTO tb_dietas_tipos SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `O tipo de dieta ${CAMPOS.nome} foi cadastrado com sucesso!` }) }

                                }
                            );

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
            connection.query(`SELECT * FROM tb_dietas_tipos 
                              WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `Esse tipo de dieta pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            qtd_dias: req.body.qtd_dias,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_dietas_tipos SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {

                    if (error) { res.status(400).send({ message: error.message }); connection.release(); }
                    else {

                        //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
                        var CAMPOS_NOTIFICACAO = {
                            tb_notificacoes_tipos_id: 8,
                            valor: `{}`,
                            created: Moment().format('YYYY-MM-DD HH:mm:ss')
                        };
                        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                            function (error, results, fields) {
                                connection.release();

                                if (error) { res.status(400).send({ message: error.message }) }
                                else {
                                    res.status(200).send({ message: `Os dados do tipo de dieta foram atualizados com sucesso!` })

                                }

                            })
                    }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function(err, connection) {

            connection.query(`UPDATE tb_dietas_tipos SET excluido = 1 WHERE id = ${req.params.id}`,
            function (error, results, fields) {
            connection.release();
    
                if (error) { res.status(400).send({ message: error.message }) }
                else { res.status(200).send({ message: `O tipo de dieta foi excluído com sucesso!` }) }
    
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
            connection.query(`SELECT id, nome, qtd_dias FROM tb_dietas_tipos 
                              WHERE excluido <> 1 AND id <> 1 ORDER BY nome`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message });}
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