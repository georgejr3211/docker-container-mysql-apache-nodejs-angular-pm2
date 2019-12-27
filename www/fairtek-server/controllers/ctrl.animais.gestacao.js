/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config),
    utilDB = require('../utils/utilDB');

    _ = require('underscore');

    Router.route('/')
        
        .get(function(req, res, next){
            poolQuery.getConnection(function(err, connection){
                connection.query(`SELECT animais.dia_animal, count(animais.id) AS qtd_animal
                                  FROM (
                                  SELECT id, dia_animal(tb_animais.id) -1 AS dia_animal
                                  FROM
                                      tb_animais
                                  WHERE
                                      tb_setor_tipo_id = 2 AND ativo <> 0
                                          AND excluido = 0
                                          AND calibracao <> 1) AS animais
                                  GROUP BY animais.dia_animal`,
                    function(error, rows, fields){
                        connection.release();
                        if(error){
                            res.status(500).send(error.message);
                        }
                        else{
                            
                            var animais = rows;
                            /*for(var i=0 ; i < animais.length; i++ ){
                                ult_dia    = animais[i].dia_animal;
                                ult_data   = animais[i].dosador_data
                                data_atual = Moment(new Date());
                                
                                dias_diff  = data_atual.diff(ult_data, 'days');
                                animais[i].dia_atual = ult_dia + dias_diff;
                                
                            }*/
                            console.log("animais: ", animais)
                            res.status(200).send(animais);
                        }
                    }

                );
            });

        });



/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;