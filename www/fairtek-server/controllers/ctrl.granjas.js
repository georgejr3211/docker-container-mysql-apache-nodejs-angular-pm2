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
            // connection.query(`SELECT tb_granjas.*, (SELECT count(*) from fairtek.tb_granjas WHERE excluido <> 1) as COUNT_LINHA FROM tb_granjas as tb_granjas WHERE excluido <> 1 ORDER BY id DESC ` + paginate,
            connection.query(`SELECT tb_granjas.*, (SELECT count(*) FROM tb_granjas WHERE excluido <> 1) AS COUNT_LINHA, tb_fazendas.nome AS nome_fazenda 
                              FROM tb_granjas AS tb_granjas LEFT JOIN tb_fazendas ON tb_granjas.tb_fazendas_id = tb_fazendas.id 
                              WHERE tb_granjas.excluido <> 1 ORDER BY id DESC ` + paginate,
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
                            res.status(400).send({
                                message: `Não existem granjas a serem exibidas!`
                            })
                        }
                    }

                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {

        var CAMPOS = {
            tb_fazendas_id: req.body.fazendas_id,
            nome: req.body.nome,
            localizacao: req.body.localizacao,
            endereco: req.body.endereco,
            tb_veterinarios_id: req.body.veterinarios_id,
            tb_produtores_id: req.body.produtores_id,
            tb_nutricionistas_id: req.body.nutricionistas_id,
            tb_gerentes_id: req.body.gerentes_id,
            tb_operadores_id: req.body.operadores_id,
            tb_geneticas_id: req.body.geneticas_id,
            modulo_de_producao: req.body.modulo_de_producao,
            ativo: 1,
            plano: req.body.plano,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE USUARIO JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_granjas
                              WHERE excluido <> 1 AND tb_fazendas_id = '${CAMPOS.tb_fazendas_id}' AND nome = '${CAMPOS.nome}' LIMIT 1`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(400).send({
                                message: `A granja ${CAMPOS.nome} já foi cadastrada!`
                            });
                            connection.release();
                        }

                        //EXECUTA CADASTRO
                        else {

                            connection.query(`INSERT INTO tb_granjas SET ?`, CAMPOS,
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        })
                                    } else {
                                        res.status(200).send({
                                            message: `A granja ${CAMPOS.nome} foi cadastrada com sucesso!`
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
            connection.query(`SELECT * FROM tb_granjas WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
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
                                message: `A granja pesquisada não existe!`
                            })
                        }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            tb_fazendas_id: req.body.fazendas_id,
            nome: req.body.nome,
            localizacao: req.body.localizacao,
            endereco: req.body.endereco,
            tb_veterinarios_id: req.body.veterinarios_id,
            tb_produtores_id: req.body.produtores_id,
            tb_nutricionistas_id: req.body.nutricionistas_id,
            tb_gerentes_id: req.body.gerentes_id,
            tb_operadores_id: req.body.operadores_id,
            tb_geneticas_id: req.body.geneticas_id,
            modulo_de_producao: req.body.modulo_de_producao,
            ativo: req.body.ativo,
            plano: req.body.plano,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_granjas SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `Os dados da granja ${CAMPOS.nome} foram atualizados com sucesso!`
                        })
                    }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_granjas SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `A granja foi excluída com sucesso!`
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
            connection.query(`SELECT id, nome FROM tb_granjas WHERE excluido <> 1 and ativo <> 0`,
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
                                message: `Não existem granjas a serem exibidas!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA ITENS (TB_FAZENDAS_ID)
******************************************************************************************/
Router.route('/fazenda/:id')

    //LISTA POR TB_FAZENDAS_ID
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_granjas WHERE excluido <> 1 AND tb_fazendas_id = ${req.params.id}`,
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
ROTA ITEM (ID) - BUSCA O NOME DA FAZENDA ATRAVES DO ID DA GRANJA
******************************************************************************************/
Router.route('/fazenda/data/:id')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_granjas.id, tb_granjas.tb_fazendas_id, tb_fazendas.nome 
                                FROM tb_granjas tb_granjas 
                                INNER JOIN  tb_fazendas ON
                                    tb_fazendas.id = tb_granjas.tb_fazendas_id
                                WHERE 
                                    tb_granjas.id = ${req.params.id} AND tb_granjas.excluido <> 1  AND tb_granjas.ativo = 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: "Erro ao carregar Fazenda. Contate o Suporte.", cod: 500 })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                })
        })
    })
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;