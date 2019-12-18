/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/

let express = require('express');
let Moment = require('../utils/moment'),
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
            connection.query(`SELECT tb_escores.*, (SELECT count(*) FROM tb_escores WHERE excluido <> 1) as COUNT_LINHA 
                              FROM tb_escores as tb_escores 
                              WHERE excluido <> 1 ORDER BY id DESC` + paginate,
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
        let CAMPOS = {
            nome: req.body.nome,
            peso: req.body.peso,
            medida: req.body.medida,
            created: Moment().format('YYYY-MM-DD HH:mm:ss'),
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            tb_setor_tipo_id: 2,
        };
        // console.log('CAMPOS', CAMPOS);
        poolQuery.getConnection((err, connection) => {
            //VERIFICANDO SE O ESCORE JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_escores 
                              WHERE excluido <> 1 AND (nome = '${CAMPOS.nome}' OR peso = '${CAMPOS.peso}') LIMIT 1`,
                (error, rows, fields) => {
                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            connection.release();
                            if ((rows[0].nome == req.body.nome) && (rows[0].peso == req.body.peso)) {
                                res.status(200).send({ id: 1, message: `Escore com o com o nome '${CAMPOS.nome}'e o peso '${CAMPOS.peso}' já cadastrado!` });
                            }
                            else if (rows[0].nome == req.body.nome) {
                                res.status(200).send({ id: 1, message: `Escore com o nome '${CAMPOS.nome}' já cadastrado!` });
                            } else if (rows[0].peso == req.body.peso) {
                                res.status(200).send({ id: 1, message: `Escore com o peso '${CAMPOS.peso}' já cadastrado!` });
                            }
                        }
                        //EXECUTA CADASTRO
                        else {
                            query_escore = `INSERT INTO tb_escores SET ${CAMPOS}`;
                            console.log('QUERY POST ESCORE: ', query_escore);
                            console.log('CAMPOS ELSE', CAMPOS);
                            connection.query(`INSERT INTO tb_escores SET ?`, CAMPOS, (error, results, fields) => {
                                connection.release();
                                if (error) {
                                    res.status(400).send({ message: error.message })
                                }
                                else {
                                    res.status(200).send({ id: 2, message: `O escore ${CAMPOS.nome} foi cadastrado com sucesso!` })
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
            connection.query(`SELECT id, nome, peso, medida, created, updated FROM tb_escores 
                              WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `O escore pesquisado não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            nome: req.body.nome,
            peso: req.body.peso,
            medida: req.body.medida,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_escores 
                              WHERE excluido <> 1 AND (nome = '${CAMPOS.nome}' OR peso = '${CAMPOS.peso}') LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({ message: error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length >= 1) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {
                            connection.query(`UPDATE tb_escores SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) { res.status(400).send({ message: error.message }) }
                                    else { res.status(200).send({ message: `Os dados do escore ${CAMPOS.nome} foram atualizados com sucesso!` }) }

                                }
                            );
                        }
                    }
                }
            );
        })
    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_escores SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `O escore foi excluído com sucesso!` }) }

                });
        });

    });
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, nome, peso FROM tb_escores WHERE excluido <> 1`,
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
                                message: `Não existem escores a serem exibidos!`
                            })
                        }
                    }

                });
        });

    })

module.exports = Router;