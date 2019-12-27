/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config)
utilDB = require('../utils/utilDB');


Router.route('/')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT
                                tbb.nome,
                                tbb.total,
                                tbb.id as id,
                                tbb.femea,
                                tbd.id as dos,
                                COALESCE( (
                                    SELECT COUNT(*)
                                        FROM
                                        tb_animais_registros tba2
                                    WHERE
                                    tba2.dosador_data = DATE(NOW())
                                    AND tba2.ult_dosador = tbd.id
                                    AND tba2.qa < tba2.qt),
                                0) AS qtd_parcialmente,
                                COALESCE( (
                                    SELECT COUNT(*)
                                        FROM
                                        tb_animais_registros tba2
                                    WHERE
                                    tba2.dosador_data = DATE(NOW())
                                    AND tba2.ult_dosador = tbd.id
                                    AND tba2.qa = tba2.qt),
                                0) AS qtd_totalmente
                            FROM tb_baias tbb
                        inner join tb_dosadores tbd on
                            tbd.tb_baias_id = tbb.id
                        GROUP BY
                            tbd.tb_baias_id `,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return res.status(400).send({message: error.message})
                    }
                    res.status(200).send(rows);
                })
        })


    });


module.exports = Router;