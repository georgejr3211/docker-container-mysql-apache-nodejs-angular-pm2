/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    _ = require('underscore');

/******************************************************************************************
MONGODB
******************************************************************************************/
db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config),
    utilDB = require('../utils/utilDB')

Router.route('/')

    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_dietas.*, tb_dietas_tipos.nome AS nome_tipo_dieta 
                              FROM tb_dietas AS tb_dietas LEFT JOIN tb_dietas_tipos AS tb_dietas_tipos ON tb_dietas.tipo_dieta = tb_dietas_tipos.id 
                              WHERE tb_dietas.excluido <> 1 AND tb_dietas.ativo = 1 AND tb_dietas.id <> 1 ORDER BY id DESC`,
                function (error, rows1, fields) {
                    if (error) {
                        res.status(500).send(error.message);
                        connection.release();
                    }
                    else {
                        arrayId = []
                        dieta = [];
                        config = [];
                        for (var i = 0; i < rows1.length; i++) {
                            arrayId.push(rows1[i].id);
                        };
                        connection.query(`SELECT tb_dietas_id, qtd, tb_dietas.nome AS nome_dieta 
                                          FROM tb_dieta_dias
                                            LEFT JOIN tb_dietas
                                                ON tb_dieta_dias.tb_dietas_id = tb_dietas.id
                                          WHERE tb_dieta_dias.excluido <> 1 AND tb_dieta_dias.tb_dietas_id IN (${arrayId}) AND tb_dieta_dias.ativo = 1`,
                            function (error, rows2, fields) {
                                connection.release();
                                if (error) {
                                    console.log(error.message);
                                    res.status(500).send(error.message);
                                }
                                else {

                                    for (var j = 0; j < arrayId.length; j++) {
                                        dieta[j] = { data: '', label: '%' };
                                        config[j] = _.where(rows2, {
                                            'tb_dietas_id': arrayId[j]
                                        });

                                        dieta[j].data = config[j];
                                    }
                                    res.status(200).send(dieta);
                                }
                            });

                    }
                });
        });
    });


// Router.route('/relatorio')
        //VERIFICAR O MOTIVO DESSA ROTA!!
        //poolQuery.getConnection(function (err, connection) {
        //    connection.query(`SELECT tb_dietas.*, 
        //                        (SELECT count(*) FROM tb_dietas WHERE excluido <> 1) AS COUNT_LINHA, tb_dietas_tipos.nome AS nome_tipo_dieta 
        //                      FROM tb_dietas AS tb_dietas LEFT JOIN tb_dietas_tipos AS tb_dietas_tipos ON tb_dietas.tipo_dieta = tb_dietas_tipos.id
        //                      WHERE tb_dietas.excluido <> 1 ORDER BY id DESC`,
        //        function (error, rows1, fields) {
        //            if (error) {
        //                res.status(500).send(error.message);
        //            }
        //            else {
        //                
        //
        //            }
        //        });
        //});
//

/******************************************************************************************
    POPULANDO MODULO
    ******************************************************************************************/
module.exports = Router;