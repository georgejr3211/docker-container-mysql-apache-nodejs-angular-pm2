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
            animais.brinco,
            animais.tatuagem,
            chips.chip,
            CASE
                WHEN
                    DATE_FORMAT(MAX(movimentacao.dt_movimentacao),
                            '%d-%m-%Y') IS NULL
                THEN
                    'Nunca movimentado'
                WHEN
                    DATE_FORMAT(MAX(movimentacao.dt_movimentacao),
                            '%d-%m-%Y') IS NOT NULL
                THEN
                    DATE_FORMAT(MAX(movimentacao.dt_movimentacao),
                            '%d-%m-%Y')
            END AS movimentacao
        FROM
            tb_animais AS animais
                LEFT JOIN
            tb_animais_movimentacoes AS movimentacao ON animais.id = movimentacao.tb_animal_id
                LEFT JOIN
            tb_chips AS chips ON animais.chip = chips.id
        WHERE
            animais.tb_setor_tipo_id = 1
                AND animais.excluido <> 1
                AND animais.calibracao <> 1
        GROUP BY animais.brinco , animais.tatuagem , animais.chip
        ORDER BY movimentacao`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({message: 'erro'});
                    }
                    else {
                        res.status(200).send(rows)
                    }

                })
        })


    });

    Router.route('/filtro/periodo/:inicio/:fim')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT animais.brinco, animais.tatuagem, chips.chip, date_format(MAX(movimentacao.dt_movimentacao), "%d-%m-%Y") as movimentacao
            FROM tb_animais as animais
            INNER JOIN tb_animais_movimentacoes as movimentacao on animais.id = movimentacao.tb_animal_id
            INNER JOIN tb_chips as chips on animais.chip = chips.id
            where animais.tb_setor_tipo_id = 1 AND animais.calibracao <> 1 AND (dt_movimentacao BETWEEN ${req.params.inicio} AND ${req.params.fim})
            GROUP BY animais.brinco, animais.tatuagem, animais.chip ORDER BY dt_movimentacao DESC;`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({message: error})
                    }
                    else {
                        res.status(200).send(rows)
                    }

                })
        })


    });


module.exports = Router;