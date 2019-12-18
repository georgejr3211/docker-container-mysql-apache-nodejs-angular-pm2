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

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')
    //QUAL UTILIDADE DESSE CONTROLLER?
    //LISTA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais_dietas WHERE excluido <> 1 AND calibracao <> 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `Não existem dietas a serem exibidas!` }) }
                    }

                });
        });

    })

    //CADASTRA
    .post(function (req, res, next) {

        let CAMPOS = {
            tb_animais_id: req.body.animais_id,
            tb_dietas_id: req.body.dietas_id,
            dt_inicio: Moment(req.body.dt_final).format('YYYY-MM-DD'),
            dt_prevista: Moment(req.body.dt_final).format('YYYY-MM-DD'),
            dt_final: Moment(req.body.dt_final).format('YYYY-MM-DD'),
            dia_dieta: req.body.dia_dieta,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`INSERT INTO tb_animais_dietas SET ?`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `A dieta foi cadastrada com sucesso!` }) }

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
            connection.query(`SELECT * FROM tb_animais_dietas WHERE excluido <> 1 AND calibracao <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(400).send({ message: `A dieta pesquisada não existe!` }) }
                    }

                });
        });

    })

    //ATUALIZA
    .put(function (req, res, next) {

        var CAMPOS = {
            tb_animais_id: req.body.animais_id,
            tb_dietas_id: req.body.dietas_id,
            dt_inicio: req.body.dt_inicio,
            dt_prevista: req.body.dt_prevista,
            dt_final: req.body.dt_final,
            dia_dieta: req.body.dia_dieta,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        };

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_animais_dietas SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `Os dados da dieta foram atualizadas com sucesso!` }) }

                });
        });

    })

    //DELETA
    .delete(function (req, res) {

        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_animais_dietas SET excluido = 1 WHERE id = ${req.params.id}`,
                function (error, results, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else { res.status(200).send({ message: `A dieta foi excluída com sucesso!` }) }

                });
        });

    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;