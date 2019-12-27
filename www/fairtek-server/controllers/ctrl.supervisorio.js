/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),


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

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_baias WHERE excluido <> 1 and ativo = 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).json(rows)
                        } else {
                            res.status(200).send([])
                        }
                    }

                });
        });

    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;