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


    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                tb_animais.id,
                                tb_animais.tatuagem,
                                tb_animais.brinco,
                                tb_chips.chip AS chip_num,
                                tb_baias.nome AS baia,
                                tb_dietas.nome AS dieta,
                                tb_escores.nome AS escore,
                                (SELECT DATE_FORMAT(dt_movimentacao, '%d/%m/%Y') FROM tb_animais_movimentacoes WHERE tb_animal_id = tb_animais.id ORDER BY dt_movimentacao DESC LIMIT 1) AS dt_movimentacao,
                                (SELECT DATE_FORMAT(dt_inseminacao, '%d/%m/%Y') FROM tb_animais_movimentacoes WHERE tb_animal_id = tb_animais.id ORDER BY dt_movimentacao DESC LIMIT 1) AS dt_inseminacao,
                                dia_animal(tb_animais.id)AS dia_atual,
                                (SELECT  dosador_data FROM tb_animais_registros WHERE tb_animais_registros.tb_animais_id = tb_animais.id ORDER BY tb_animais_registros.dosador_data DESC LIMIT 1) AS dosador_data,
                                (SELECT qtd FROM tb_dieta_dias WHERE tb_dieta_dias.tb_dietas_id = tb_animais.tb_dieta_id AND tb_dieta_dias.dia = (SELECT dia_animal(tb_animais.id)) AND tb_dieta_dias.ativo = 1) as qt_animal
                            FROM
                                tb_animais
                                    LEFT JOIN
                                tb_chips ON tb_chips.id = tb_animais.chip
                                    LEFT JOIN
                                tb_baias ON tb_baias.id = tb_animais.baias_id
                                    LEFT JOIN
                                tb_dietas ON tb_dietas.id = tb_animais.tb_dieta_id
                                    LEFT JOIN
                                tb_escores ON tb_escores.id = tb_animais.escore_id
                            WHERE
                                tb_animais.ativo = 1
                                    AND tb_animais.excluido <> 1
                                    AND tb_setor_tipo_id = 2
                                    AND tb_animais.calibracao <> 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: error });
                    }
                    else {
                        res.status(200).send(rows);
                    }
                });

        });

    });


    Router.route('/filtro/periodo/:inicio/:fim')

        .get(function (req, res, next) {
            poolQuery.getConnection(function (err, connection) {
                connection.query(`SELECT 
                                    DISTINCT(tb_animais.id),
                                    tb_animais.tatuagem,
                                    tb_animais.brinco,
                                    tb_chips.chip AS chip_num,
                                    tb_baias.nome AS baia,
                                    tb_dietas.nome AS dieta,
                                    tb_escores.nome AS escore,
                                    (SELECT DATE_FORMAT(dt_movimentacao, '%d/%m/%Y') FROM tb_animais_movimentacoes WHERE tb_animal_id = tb_animais.id ORDER BY dt_movimentacao DESC LIMIT 1) AS dt_movimentacao,
                                    (SELECT DATE_FORMAT(dt_inseminacao, '%d/%m/%Y') FROM tb_animais_movimentacoes WHERE tb_animal_id = tb_animais.id ORDER BY dt_movimentacao DESC LIMIT 1) AS dt_inseminacao,
                                    dia_animal(tb_animais.id)AS dia_atual,
                                    (SELECT  dosador_data FROM tb_animais_registros WHERE tb_animais_registros.tb_animais_id = tb_animais.id ORDER BY tb_animais_registros.dosador_data DESC LIMIT 1) AS dosador_data,
                                    (SELECT qtd FROM tb_dieta_dias WHERE tb_dieta_dias.tb_dietas_id = tb_animais.tb_dieta_id AND tb_dieta_dias.dia = (SELECT dia_animal(tb_animais.id)) AND tb_dieta_dias.ativo = 1) as qt_animal
                                FROM
                                    tb_animais
                                        LEFT JOIN
                                    tb_chips ON tb_chips.id = tb_animais.chip
                                        LEFT JOIN
                                    tb_baias ON tb_baias.id = tb_animais.baias_id
                                        LEFT JOIN
                                    tb_dietas ON tb_dietas.id = tb_animais.tb_dieta_id
                                        LEFT JOIN
                                    tb_escores ON tb_escores.id = tb_animais.escore_id
                                        LEFT JOIN
                                    tb_animais_movimentacoes ON tb_animais_movimentacoes.tb_animal_id = tb_animais.id
                                WHERE
                                    tb_animais.ativo = 1
                                        AND tb_animais.excluido <> 1
                                        AND tb_animais.calibracao <> 1
                                        AND tb_animais.tb_setor_tipo_id = 2 AND (dt_movimentacao BETWEEN ${req.params.inicio} AND ${req.params.fim})`,
                    function (error, rows, fields) {
                        connection.release();
                        if (error) {
                            res.status(500).send({ message: error });
                        }
                        else {
                            res.status(200).send(rows);
                        }
                    });
            })
        });





/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;