/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    Moment = require('../utils/moment'),

/******************************************************************************************
MONGODB
******************************************************************************************/
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config);

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {

        var data = Moment();

        data = Moment(data).subtract(1, 'd');

        dataFormatada = Moment(data).format('YYYY-MM-DD H:mm:ss');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_registros.tb_animais_id, sum(tb_registros.qa) as total_qa, tb_registros.dia_animal, tb_registros.tb_baias_id, tb_registros.tb_dosadores_id,
                                DATE_FORMAT(tb_registros.qa_data, '%d/%m/%Y %H:%i:%s') as qa_data, tb_registros.qr_dieta, tb_registros.codigo_dieta 
                              FROM tb_registros as tb_registros
                              WHERE qa_data >= '${dataFormatada}' 
                              GROUP BY tb_registros.tb_animais_id`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).json(rows) }
                        else { res.status(200).send([]) }
                    }

                });
        });

    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
