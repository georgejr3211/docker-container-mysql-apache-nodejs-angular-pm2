/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    _ = require('underscore'),
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config)
utilDB = require('../utils/utilDB');


Router.route('/')
    .get(function (req, res, next) {
        var data1 = Moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
        var data2 = Moment().subtract(2, 'days').format('YYYY-MM-DD 00:00:00');
        var data3 = Moment().subtract(3, 'days').format('YYYY-MM-DD 00:00:00');
        var data4 = Moment().subtract(4, 'days').format('YYYY-MM-DD 00:00:00');
        var data5 = Moment().subtract(5, 'days').format('YYYY-MM-DD 00:00:00');
        var data6 = Moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00');
        var data7 = Moment().subtract(7, 'days').format('YYYY-MM-DD 00:00:00');

        console.log(":::Datas::: ", data1, data2, data3, data4, data5, data6, data7)
        // ROTA RAIZ: ALIMENTADOS 100%
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT
            baia_id AS baia_atual,
            (SELECT DISTINCT(nome) FROM tb_baias WHERE baia_id = tb_baias.id) AS nome_baia,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5_apto,
            (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6,
            (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6_apto,
            DATE_FORMAT((SELECT MIN(created) 
		        FROM tb_animais_movimentacoes WHERE tb_setor_tipo_id = 2 AND tb_baias_id = baia_id AND 
		        (SELECT id FROM tb_animais  WHERE excluido = 0 AND calibracao = 0 
                AND tb_setor_tipo_id = 2 AND baias_id = baia_id ORDER BY id ASC LIMIT 1) = tb_animal_id LIMIT 1), '%d-%m-%Y') AS data_entrada
            FROM
            tb_dados_historicos
                INNER JOIN
                    tb_baias AS baias ON baias.id = baia_id
            ORDER BY nome_baia, data_entrada ASC`,
                function (error, rows, fields) {
                    if (error) {
                        connection.release();
                        res.status(400).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows);
                    }
                })
        })

    });

/*****************************************************
FILTRO /100% ALIMENTADO /PARCIALMENTE /NÃO ALIMENTADO
*****************************************************/
Router.route('/filtro/:tipo/:percentual')
    .get(function (req, res, next) {
        var data1 = Moment().subtract(1, 'days').format('DD-MM-YYYY');
        var data2 = Moment().subtract(2, 'days').format('DD-MM-YYYY');
        var data3 = Moment().subtract(3, 'days').format('DD-MM-YYYY');
        var data4 = Moment().subtract(4, 'days').format('DD-MM-YYYY');
        var data5 = Moment().subtract(5, 'days').format('DD-MM-YYYY');
        var data6 = Moment().subtract(6, 'days').format('DD-MM-YYYY');
        var data7 = Moment().subtract(7, 'days').format('DD-MM-YYYY');
        console.log("Datas:", data1, data2, data3, data4, data5, data6, data7)
        if (req.params.tipo == 1) {
            // FILTRO: ALIMENTADOS 100%
            poolQuery.getConnection(function (err, connection) {
                connection.query(`SELECT
                baia_id AS baia_atual,
                (SELECT DISTINCT(nome) FROM tb_baias WHERE baia_id = tb_baias.id) AS nome_baia,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_total_baia) = 0 THEN 0 ELSE qtde_alimentados_total_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6_apto,
                DATE_FORMAT((SELECT MIN(created) 
                    FROM tb_animais_movimentacoes WHERE tb_setor_tipo_id = 2 AND tb_baias_id = baia_id AND 
                    (SELECT id FROM tb_animais  WHERE excluido = 0 AND calibracao = 0 
                    AND tb_setor_tipo_id = 2 AND baias_id = baia_id ORDER BY id ASC LIMIT 1) = tb_animal_id LIMIT 1), '%d-%m-%Y') AS data_entrada
            FROM
                tb_dados_historicos
                INNER JOIN
                    tb_baias AS baias ON baias.id = baia_id
            ORDER BY nome_baia, data_entrada ASC`,
                    function (error, rows, fields) {
                        if (error) {
                            connection.release();
                            res.status(400).send({ message: error.message })
                        }
                        else {
                            res.status(200).send(rows);
                        }
                    })
            })
        }
        if (req.params.tipo == 2) {
            // ALIMENTADOS PARCIALMENTE
            poolQuery.getConnection(function (err, connection) {
                connection.query(`SELECT
                baia_id AS baia_atual,
                (SELECT DISTINCT(nome) FROM tb_baias WHERE baia_id = tb_baias.id) AS nome_baia,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5_apto,
                (SELECT CASE WHEN COUNT(qtde_alimentados_parcial_baia) = 0 THEN 0 ELSE qtde_alimentados_parcial_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6_apto,
                DATE_FORMAT((SELECT MIN(created) 
                    FROM tb_animais_movimentacoes WHERE tb_setor_tipo_id = 2 AND tb_baias_id = baia_id AND 
                    (SELECT id FROM tb_animais  WHERE excluido = 0 AND calibracao = 0 
                    AND tb_setor_tipo_id = 2 AND baias_id = baia_id ORDER BY id ASC LIMIT 1) = tb_animal_id LIMIT 1), '%d-%m-%Y') AS data_entrada
            FROM
                tb_dados_historicos
                INNER JOIN
                    tb_baias AS baias ON baias.id = baia_id
            ORDER BY nome_baia, data_entrada ASC`,
                    function (error, rows, fields) {
                        if (error) {
                            connection.release();
                            res.status(400).send({ message: error.message })
                        }
                        else {
                            res.status(200).send(rows);
                        }
                    })
            })
        }
        if (req.params.tipo == 3) {
            //BUSCA BAIAS, DATA DE ENTRADA E QUANTIDADE DE MATRIZES QUE ESTEJAM NA GESTAÇÃO
            poolQuery.getConnection(function (err, connection) {
                connection.query(`SELECT
                baia_id AS baia_atual,
                (SELECT DISTINCT(nome) FROM tb_baias WHERE baia_id = tb_baias.id) AS nome_baia,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data1}' LIMIT 1) AS dia0_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data2}' LIMIT 1) AS dia1_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data3}' LIMIT 1) AS dia2_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data4}' LIMIT 1) AS dia3_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data5}' LIMIT 1) AS dia4_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data6}' LIMIT 1) AS dia5_apto,
                (SELECT CASE WHEN COUNT(qtde_nao_alimentados_baia) = 0 THEN 0 ELSE qtde_nao_alimentados_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6,
                (SELECT CASE WHEN COUNT(qtde_animais_aptos_alimentar_baia) = 0 THEN 0 ELSE qtde_animais_aptos_alimentar_baia END FROM tb_dados_historicos WHERE baia_id = baias.id AND DATE(created) = '${data7}' LIMIT 1) AS dia6_apto,
                DATE_FORMAT((SELECT MIN(created) 
                    FROM tb_animais_movimentacoes WHERE tb_setor_tipo_id = 2 AND tb_baias_id = baia_id AND 
                    (SELECT id FROM tb_animais  WHERE excluido = 0 AND calibracao = 0 
                    AND tb_setor_tipo_id = 2 AND baias_id = baia_id ORDER BY id ASC LIMIT 1) = tb_animal_id LIMIT 1), '%d-%m-%Y') AS data_entrada
            FROM
                tb_dados_historicos
                INNER JOIN
                    tb_baias AS baias ON baias.id = baia_id
            ORDER BY nome_baia, data_entrada ASC`,
                    function (error, rows, fields) {
                        if (error) {
                            connection.release();
                            res.status(400).send({ message: error.message })
                        }
                        else {
                            res.status(200).send(rows);
                        }
                    })
            })
        }
    });

module.exports = Router;