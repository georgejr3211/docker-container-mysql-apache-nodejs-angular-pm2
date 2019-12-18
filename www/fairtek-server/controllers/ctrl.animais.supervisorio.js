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


//LISTA
function getAnimais() {
    return new Promise(function (resolve, reject) {

        var dataAtual = Moment().format('YYYY-MM-DD 00:00:00');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais.*, tb_baias.nome as baia_nome, tb_chips.chip as chip_num, tb_dietas.nome as nome_dieta, tb_galpoes.nome as galpao_nome, (SELECT dia FROM tb_animais_registros WHERE tb_animais_id = tb_animais.id ORDER BY id DESC LIMIT 1) as ultimo_dia
                                FROM tb_animais as tb_animais 
                                    LEFT JOIN tb_baias as tb_baias ON (tb_baias.id = tb_animais.baias_id)
                                    LEFT JOIN tb_chips as tb_chips ON (tb_chips.id = tb_animais.chip)
                                    LEFT JOIN tb_dietas as tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
                                    LEFT JOIN tb_galpoes as tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id) 
                                WHERE tb_animais.excluido <> 1 AND tb_animais.ativo = 1 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.calibracao <> 1 ANDtb_animais.created < '${dataAtual}' ORDER BY tb_animais.id DESC;`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                });
        });
    });
}


// Animais por Baia

Router.route('/baia/:id')

    .get((req, res, next) => {
        let dataAtual = Moment().format('YYYY-MM-DD 00:00:00');
        poolQuery.getConnection((err, connection) => {
            connection.query(`SELECT 
                                tb_animais.brinco,
                                tb_animais.tatuagem,
                                tb_chips.chip AS chip_num,
                                tb_dietas.nome AS dieta_nome,
                                tb_escores.nome AS escore_nome,
                                tb_escores.peso AS peso,
                                (SELECT DIA_ANIMAL(tb_animais.id)) AS dia_animal,
                                (SELECT 
                                        qr
                                    FROM
                                        tb_dieta_dias
                                    WHERE
                                        tb_animais.tb_dieta_id = tb_dieta_dias.tb_dietas_id
                                            AND ativo = 1
                                            AND excluido <> 1
                                            AND tb_dieta_dias.dia = dia_animal) AS qt_animal,
                                (SELECT 
                                        dosador_data
                                    FROM
                                        tb_animais_registros
                                    WHERE
                                        tb_animais_registros.tb_animais_id = tb_animais.id
                                            AND tb_animais.ciclo_animal = tb_animais_registros.ciclo_animal
                                    ORDER BY tb_animais_registros.dosador_data DESC
                                    LIMIT 1) AS dosador_data,
                                (SELECT 
                                        dt_inseminacao
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = tb_animais.id
                                            AND tb_animais_movimentacoes.tb_setor_tipo_id = 2
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) AS dt_inseminacao
                            FROM
                                tb_animais
                                    LEFT JOIN
                                tb_chips ON tb_animais.chip = tb_chips.id
                                    LEFT JOIN
                                tb_dietas ON tb_animais.tb_dieta_id = tb_dietas.id
                                    LEFT JOIN
                                tb_escores ON tb_animais.escore_id = tb_escores.id
                            WHERE
                                baias_id = ${req.params.id} 
                                    AND tb_animais.excluido = 0
                                    AND tb_animais.ativo = 1
                                    AND tb_animais.tb_setor_tipo_id <> 1
                                    AND tb_animais.calibracao <> 1
                                    AND tb_animais.created < '${dataAtual}'`,
                (error, rows, fields) => {
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error });
                    }
                    else {
                        //LOOP PARA ACRESCENTAR/DIMINUIR O QT DO ANIMAL, COM BASE NO SEU SCORE
                        animais = rows;
                        for (let i = 0; i < animais.length; i += 1) {
                            console.log("ANIMAL ANTESS: ", animais[i].brinco, animais[i].qt_animal, animais[i].peso)
                            animais[i].qt_animal = animais[i].qt_animal * 100;
                            animais[i].qt_animal = animais[i].qt_animal + animais[i].peso;
                            animais[i].qt_animal = animais[i].qt_animal / 100;
                        }
                        poolQuery.getConnection((err, connection) => {
                            connection.query(`SELECT 
                                                tb_animais_registros.tb_animais_id,
                                                tb_animais_registros.dia,
                                                tb_animais_registros.qa,
                                                tb_animais_registros.qt
                                            FROM
                                                tb_animais_registros AS tb_animais_registros
                                                    INNER JOIN
                                                tb_animais AS tb_animais ON tb_animais.id = tb_animais_registros.tb_animais_id
                                            WHERE
                                                tb_animais.ciclo_animal = tb_animais_registros.ciclo_animal
                                                    AND dosador_data = DATE(NOW())`,
                                (error, rows, fields) => {
                                    if (error) {
                                        res.status(400).send({ message: error });
                                    }
                                    else {
                                        registros = rows;
                                        for (let i = 0; i < animais.length; i += 1) {
                                            animais[i].comeu = 0;
                                            animais[i].qa_animal = 0;
                                            let alimentados = _.where(registros, {
                                                'tb_animais_id': animais[i].id
                                            });
                                            if (alimentados.length > 0) {
                                                animais[i].comeu = 1;
                                                animais[i].dia_animal = alimentados[0].dia;
                                                animais[i].qa_animal = alimentados[0].qa;
                                                animais[i].qt_animal = alimentados[0].qt;
                                            }
                                            else {
                                                if (animais[i].dosador_data != null) {
                                                    let dataAtual = Moment(new Date());
                                                    let ult_dia = animais[i].dosador_data;
                                                    let dias = dataAtual.diff(ult_dia, "days");
                                                    animais[i].dia_animal = animais[i].dia_animal + dias;
                                                }
                                                else {
                                                    let dataAtual = Moment(new Date());
                                                    let ult_dia = Moment(animais[i].dt_inseminacao).format('YYYY-MM-DD');
                                                    let dias = dataAtual.diff(ult_dia, "days");
                                                    animais[i].dia_animal = 1 + dias;
                                                }
                                            }
                                        }
                                        res.status(200).send(animais);
                                    }
                                }
                            );
                        })
                    }
                });
        });
        // poolQuery.getConnection(function (err, connection) {
        //     var dataAtual = Moment().format('YYYY-MM-DD 00:00:00');
        //     connection.query(`SELECT DISTINCT 
        //                         tb_animais.*,
        //                         IF(MAX(tb_animais_registros.dosador_data) = DATE(now()),tb_animais_registros.qa, 0) AS qa_animal,
        //                         tb_animais_registros.qt AS qt_animal,
        //                         MAX(tb_animais_registros.dia) AS dia_animal,
        //                         IF(MAX(tb_animais_registros.dosador_data) = DATE(now()),MAX(tb_animais_registros.dosador_data),null)
        //                         AS dosador_data,
        //                         tb_chips.chip AS chip_num
        //                       FROM
        //                         tb_animais
        //                             LEFT JOIN
        //                         tb_animais_registros AS tb_animais_registros ON tb_animais.id = tb_animais_registros.tb_animais_id
        //                             LEFT JOIN
        //                         tb_chips AS tb_chips ON tb_animais.chip = tb_chips.id
        //                       WHERE
        //                         baias_id =${req.params.id} AND tb_animais.excluido = 0 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.created < '${dataAtual}'`,
        //         function (error, rows, fields) {
        //             connection.release();

        //             if (error) {
        //                 res.status(400).send({
        //                     message: error.message
        //                 })
        //             } else {
        //                 if (rows.length > 0) {
        //                     res.status(200).send(rows)
        //                 } else {
        //                     res.status(200).send([])
        //                 }
        //             }

        //         });
        // });

    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;