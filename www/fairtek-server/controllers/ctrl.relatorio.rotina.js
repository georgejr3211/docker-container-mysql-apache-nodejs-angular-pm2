/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require("express"),
    Moment = require("../utils/moment"),
    Router = express.Router(),
    _ = require("underscore");

var db = require("../connect/db");
var mysql = require("mysql");
var poolQuery = mysql.createPool(db.config);
utilDB = require("../utils/utilDB");

/*
 * FUNCTION COM PROMISE
 */

function getAnimais() {
    return new Promise((resolve, reject) => {
        var dataAtual = Moment().format("YYYY-MM-DD 00:00:00");

        poolQuery.getConnection((err, connection) => {
            connection.query(
                            `SELECT 
                            tb_animais.id AS tb_animais_id,
                            tb_baias.nome AS nome_baia,
                            tb_animais.*,
                            tb_baias.nome AS baia_nome,
                            tb_chips.chip AS chip_num,
                            tb_dietas.nome AS nome_dieta,
                            tb_galpoes.nome AS galpao_nome,
                            (SELECT 
                                    dia
                                FROM
                                    tb_animais_registros
                                WHERE
                                    tb_animais_id = tb_animais.id
                                ORDER BY id DESC
                                LIMIT 1) AS ultimo_dia,
                            (SELECT 
                                    dt_inseminacao
                                FROM
                                    tb_animais_movimentacoes
                                WHERE
                                    tb_animal_id = tb_animais.id
                                        AND tb_animais_movimentacoes.tb_setor_tipo_id = 2
                                ORDER BY tb_animais_movimentacoes.id DESC
                                LIMIT 1) AS dt_inseminacao,
                            (SELECT 
                                    qr
                                FROM
                                    tb_dieta_dias
                                WHERE
                                    tb_animais.tb_dieta_id = tb_dieta_dias.tb_dietas_id
                                        AND ativo = 1
                                        AND excluido = 0
                                        AND tb_dieta_dias.dia = dia
                                LIMIT 1) AS qt,
                            '' AS qa
                        FROM
                            tb_animais AS tb_animais
                                LEFT JOIN
                            tb_baias AS tb_baias ON (tb_baias.id = tb_animais.baias_id)
                                LEFT JOIN
                            tb_chips AS tb_chips ON (tb_chips.id = tb_animais.chip)
                                LEFT JOIN
                            tb_dietas AS tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
                                LEFT JOIN
                            tb_galpoes AS tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id)
                        WHERE
                            tb_animais.excluido <> 1
                                AND tb_animais.ativo = 1
                                AND tb_animais.tb_setor_tipo_id = 2
                                AND tb_animais.created < '${dataAtual}'
                                AND tb_animais.calibracao = 0
                        ORDER BY tb_animais.id DESC`,

                // ANTIGA QUERY
                /*
                            SELECT tb_animais.*, tb_baias.nome as baia_nome, tb_chips.chip as chip_num, tb_dietas.nome as nome_dieta, tb_galpoes.nome as galpao_nome, (SELECT dia FROM tb_animais_registros WHERE tb_animais_id = tb_animais.id ORDER BY id DESC LIMIT 1) as ultimo_dia,
                                        (SELECT dt_inseminacao FROM tb_animais_movimentacoes where tb_animal_id = tb_animais.id AND tb_animais_movimentacoes.tb_setor_tipo_id = 2 ORDER BY tb_animais_movimentacoes.id DESC limit 1) as dt_inseminacao
                                        FROM tb_animais as tb_animais 
                                            LEFT JOIN tb_baias as tb_baias ON (tb_baias.id = tb_animais.baias_id)
                                            LEFT JOIN tb_chips as tb_chips ON (tb_chips.id = tb_animais.chip)
                                            LEFT JOIN tb_dietas as tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
                                            LEFT JOIN tb_galpoes as tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id) 
                                        WHERE tb_animais.excluido <> 1 AND tb_animais.ativo = 1 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.created < '${dataAtual}' ORDER BY tb_animais.id DESC;
                        */
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                }
            );
        });
    });
}

/**********************
 *FUNÇÃO DE BUSCA PARA TODOS ANIMAIS COM UTILIZAÇÃO NOS RELATORIOS - TAL FUNÇÃO ELIMINA ANIMAIS CADASTRADOS NO DIA ANTERIOR
 ***********************/

function getAnimaisRelatorios() {
    return new Promise(function (resolve, reject) {
        var dataAtual = Moment().format("YYYY-MM-DD 00:00:00");

        poolQuery.getConnection(function (err, connection) {
            connection.query(
                            `SELECT 
                            tb_animais.*,
                            tb_baias.nome AS baia_nome,
                            tb_chips.chip AS chip_num,
                            tb_dietas.nome AS nome_dieta,
                            tb_galpoes.nome AS galpao_nome,
                            (SELECT 
                                    dia
                                FROM
                                    tb_animais_registros
                                WHERE
                                    tb_animais_id = tb_animais.id
                                ORDER BY id DESC
                                LIMIT 1) AS ultimo_dia,
                            (SELECT 
                                    dt_inseminacao
                                FROM
                                    tb_animais_movimentacoes
                                WHERE
                                    tb_animal_id = tb_animais.id
                                        AND tb_animais_movimentacoes.tb_setor_tipo_id = 2
                                ORDER BY tb_animais_movimentacoes.id DESC
                                LIMIT 1) AS dt_inseminacao,
                            (SELECT 
                                    qr
                                FROM
                                    tb_dieta_dias
                                WHERE
                                    tb_animais.tb_dieta_id = tb_dieta_dias.tb_dietas_id
                                        AND ativo = 1
                                        AND excluido = 0
                                        AND tb_dieta_dias.dia = dia
                                LIMIT 1) AS qt,
                            '' AS qa
                        FROM
                            tb_animais AS tb_animais
                                LEFT JOIN
                            tb_baias AS tb_baias ON (tb_baias.id = tb_animais.baias_id)
                                LEFT JOIN
                            tb_chips AS tb_chips ON (tb_chips.id = tb_animais.chip)
                                LEFT JOIN
                            tb_dietas AS tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
                                LEFT JOIN
                            tb_galpoes AS tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id)
                        WHERE
                            tb_animais.excluido <> 1
                                AND tb_animais.ativo = 1
                                AND tb_animais.tb_setor_tipo_id = 2
                                AND DATE_ADD(tb_animais.created,
                                INTERVAL 1 DAY) < '${dataAtual}'
                                AND tb_animais.calibracao = 0
                        ORDER BY tb_animais.id DESC`,

                // ANTIGA QUERY
                /*
                            SELECT tb_animais.*, tb_baias.nome as baia_nome, tb_chips.chip as chip_num, tb_dietas.nome as nome_dieta, tb_galpoes.nome as galpao_nome, (SELECT dia FROM tb_animais_registros WHERE tb_animais_id = tb_animais.id ORDER BY id DESC LIMIT 1) as ultimo_dia,
                                        (SELECT dt_inseminacao FROM tb_animais_movimentacoes where tb_animal_id = tb_animais.id AND tb_animais_movimentacoes.tb_setor_tipo_id = 2 ORDER BY tb_animais_movimentacoes.id DESC limit 1) as dt_inseminacao
                                        FROM tb_animais as tb_animais 
                                            LEFT JOIN tb_baias as tb_baias ON (tb_baias.id = tb_animais.baias_id)
                                            LEFT JOIN tb_chips as tb_chips ON (tb_chips.id = tb_animais.chip)
                                            LEFT JOIN tb_dietas as tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
                                            LEFT JOIN tb_galpoes as tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id) 
                                        WHERE tb_animais.excluido <> 1 AND tb_animais.ativo = 1 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.created < '${dataAtual}' ORDER BY tb_animais.id DESC;
                        */
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                }
            );
        });
    });
}

async function animaisNaoAlimentados24hrs() {
    var dataAtual = Moment().format('YYYY-MM-DD');
    var ontem = Moment().subtract(1, 'days').format('YYYY-MM-DD');
    var anteontem = Moment().subtract(2, 'days').format('YYYY-MM-DD');
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            animais_alimentados.id AS id,
            brinco,
            tempo_entre_dosagem,
            ultimo_dia,            
            (SELECT 
                    chip
                FROM
                    tb_chips
                WHERE
                    animais_alimentados.chip = tb_chips.id) AS chip_num,
            (SELECT 
                    nome
                FROM
                    tb_baias
                WHERE
                    animais_alimentados.baias_id = tb_baias.id) AS baia_nome,
            (SELECT 
                    nome
                FROM
                    tb_dietas
                WHERE
                    animais_alimentados.tb_dieta_id = tb_dietas.id) AS nome_dieta,
            (SELECT 
                    CASE
                            WHEN
                                 (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) = '${dataAtual}'
                                    OR (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) > '${dataAtual}'  
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'
                        END AS 'qa'
                FROM
					tb_animais_movimentacoes AS tam
                    left join tb_animais_registros as tb_ar on tam.tb_animal_id = tb_ar.tb_animais_id 
                WHERE
                    tb_ar.tb_animais_id = animais_alimentados.id
                        AND ( tb_ar.dosador_data = '${dataAtual}' OR tb_ar.dosador_data IS NULL) limit 1) AS hoje,
            (SELECT 
                    CASE
                            WHEN
                                 (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) = '${ontem}'
                                    OR (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) > '${ontem}'  
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'
                        END AS 'qa'
                FROM
					tb_animais_movimentacoes AS tam
                    left join tb_animais_registros as tb_ar on tam.tb_animal_id = tb_ar.tb_animais_id 
                WHERE
                    tb_ar.tb_animais_id = animais_alimentados.id
                        AND ( tb_ar.dosador_data = '${ontem}' OR tb_ar.dosador_data IS NULL) limit 1) AS ontem,
            (SELECT 
                    CASE
                            WHEN
                                (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) = '${anteontem}'
                                    OR (SELECT 
                                        MAX(DATE(created))
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    LIMIT 1) > '${anteontem}'                                    
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'                            
                        END AS 'qa'
                FROM
					tb_animais_movimentacoes AS tam
                    left join tb_animais_registros as tb_ar on tam.tb_animal_id = tb_ar.tb_animais_id 
                WHERE
                    tam.tb_animal_id = animais_alimentados.id
                        AND ( tb_ar.dosador_data = '${anteontem}' OR tb_ar.dosador_data IS NULL) limit 1) AS anteontem
        FROM
            (SELECT 
                animais.id,
                    animais.brinco,
                    animais.chip,
                    animais.baias_id,
                    animais.tempo_entre_dosagem,
                    animais.tb_dieta_id,
                    CASE
                        WHEN DIA_ANIMAL(animais.id) IS NULL THEN '--'
                        ELSE DIA_ANIMAL(animais.id)
                    END AS ultimo_dia
            FROM
                tb_animais AS animais
            LEFT JOIN tb_animais_registros AS a_registros ON animais.id = a_registros.tb_animais_id
            WHERE
                animais.calibracao = 0
                AND animais.tb_setor_tipo_id = 2
                    AND ((SELECT 
                        MAX(DATE(movimentacoes.created))
                    FROM
                        tb_animais_movimentacoes AS movimentacoes
                    WHERE
                        movimentacoes.tb_animal_id = animais.id
                    GROUP BY movimentacoes.tb_animal_id
                    ORDER BY movimentacoes.id DESC
                    LIMIT 1) < '${ontem}')
                    AND animais.excluido = 0
                    AND animais.id NOT IN (SELECT 
                        tb_animais_id
                    FROM
                        tb_animais_registros
                    WHERE
                        qa > 0
                            AND dosador_data = '${ontem}')
            GROUP BY animais.id) AS animais_alimentados
        ORDER BY (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem IS NULL) DESC , (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem = 'Parcialmente') DESC , (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem = 'Completamente') DESC`,
                function (error, rows, fields) {
                    connection.release();
                    return resolve(rows);
                }
            );
        });
    });
}

async function animaisNaoAlimentados48hrs() {
    var dataAtual = Moment().format('YYYY-MM-DD');
    var ontem = Moment().subtract(1, 'days').format('YYYY-MM-DD');
    var anteontem = Moment().subtract(2, 'days').format('YYYY-MM-DD');
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            animais_alimentados.id AS id,
            brinco,
            tempo_entre_dosagem,
            ultimo_dia,
            (SELECT 
                    chip
                FROM
                    tb_chips
                WHERE
                    animais_alimentados.chip = tb_chips.id) AS chip_num,
            (SELECT 
                    nome
                FROM
                    tb_baias
                WHERE
                    animais_alimentados.baias_id = tb_baias.id) AS baia_nome,
            (SELECT 
                    nome
                FROM
                    tb_dietas
                WHERE
                    animais_alimentados.tb_dieta_id = tb_dietas.id) AS nome_dieta,
            (SELECT 
                    CASE
                            WHEN
                                (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) = '${dataAtual}'
                                    OR (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) > '${dataAtual}'
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'
                        END AS 'qa'
                FROM
                    tb_animais_movimentacoes AS tam
                        LEFT JOIN
                    tb_animais_registros AS tb_ar ON tam.tb_animal_id = tb_ar.tb_animais_id
                WHERE
                    tb_ar.tb_animais_id = animais_alimentados.id
                        AND (tb_ar.dosador_data = '${dataAtual}'
                        OR tb_ar.dosador_data IS NULL)
                LIMIT 1) AS hoje,
            (SELECT 
                    CASE
                            WHEN
                                (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) = '${ontem}'
                                    OR (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) > '${ontem}'
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'
                        END AS 'qa'
                FROM
                    tb_animais_movimentacoes AS tam
                        LEFT JOIN
                    tb_animais_registros AS tb_ar ON tam.tb_animal_id = tb_ar.tb_animais_id
                WHERE
                    tb_ar.tb_animais_id = animais_alimentados.id
                        AND (tb_ar.dosador_data = '${ontem}'
                        OR tb_ar.dosador_data IS NULL)
                LIMIT 1) AS ontem,
            (SELECT 
                    CASE
                            WHEN
                                (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) = '${anteontem}'
                                    OR (SELECT 
                                        DATE(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        tb_animal_id = animais_alimentados.id
                                    ORDER BY tb_animais_movimentacoes.id DESC
                                    LIMIT 1) > '${anteontem}'
                            THEN
                                'Sem_direito'
                            WHEN qa > 0 AND qa < qt THEN 'Parcialmente'
                            WHEN qa >= qt THEN 'Completamente'
                        END AS 'qa'
                FROM
                    tb_animais_movimentacoes AS tam
                        LEFT JOIN
                    tb_animais_registros AS tb_ar ON tam.tb_animal_id = tb_ar.tb_animais_id
                WHERE
                    tam.tb_animal_id = animais_alimentados.id
                        AND (tb_ar.dosador_data = '${anteontem}'
                        OR tb_ar.dosador_data IS NULL)
                LIMIT 1) AS anteontem
        FROM
            (SELECT 
                animais.id,
                    animais.brinco,
                    animais.chip,
                    animais.baias_id,
                    animais.tempo_entre_dosagem,
                    animais.tb_dieta_id,
                    CASE
                        WHEN DIA_ANIMAL(animais.id) IS NULL THEN '--'
                        ELSE DIA_ANIMAL(animais.id)
                    END AS ultimo_dia
            FROM
                tb_animais AS animais
            LEFT JOIN tb_animais_registros AS a_registros ON animais.id = a_registros.tb_animais_id
            WHERE
                animais.calibracao = 0
                    AND animais.tb_setor_tipo_id = 2
                    AND ((SELECT 
                        MAX(DATE(movimentacoes.created))
                    FROM
                        tb_animais_movimentacoes AS movimentacoes
                    WHERE
                        movimentacoes.tb_animal_id = animais.id
                    GROUP BY movimentacoes.tb_animal_id
                    ORDER BY movimentacoes.id DESC
                    LIMIT 1) < '${anteontem}')
                    AND animais.excluido = 0
                    AND animais.id NOT IN (SELECT 
                        tb_animais_id
                    FROM
                        tb_animais_registros
                    WHERE
                        qa > 0 AND dosador_data = '${ontem}')
                    AND animais.id NOT IN (SELECT 
                        tb_animais_id
                    FROM
                        tb_animais_registros
                    WHERE
                        qa > 0 AND dosador_data = '${anteontem}')
            GROUP BY animais.id) AS animais_alimentados
        ORDER BY (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem IS NULL) DESC , (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem = 'Parcialmente') DESC , (hoje IS NULL) AND (ontem IS NULL)
            AND (anteontem = 'Completamente') DESC`,
                function (error, rows, fields) {
                    connection.release();
                    return resolve(rows);
                }
            );
        });
    });
}

Router.route("/")
    //LISTA  ANIMAIS SEM ALIMENTAR POR 24HRS
    .get(async function (req, res, next) {
        var dashboard = {
            total_animais: 0,
            total_dosadores: 0,
            total_baias: 0,
            total_galpoes: 0,
            total_dosadores_inativos: 0,
            total_animais_gestacao: 0,
            animais_nao_alimentados_24_hrs: [],
            animais_nao_alimentados_48_hrs: []
        };

        dashboard.animais_nao_alimentados_24_hrs = await animaisNaoAlimentados24hrs()
            .then(function (rows) {
                return rows;
            })
            .catch(err =>
                setImmediate(() => {
                    throw err;
                })
            );
        res.status(200).send(dashboard);
    });

Router.route("/dois-dias")
    //LISTA  ANIMAIS SEM ALIMENTAR POR 48HRS
    .get(async function (req, res, next) {
        var dashboard = {
            total_animais: 0,
            total_dosadores: 0,
            total_baias: 0,
            total_galpoes: 0,
            total_dosadores_inativos: 0,
            total_animais_gestacao: 0,
            animais_nao_alimentados_24_hrs: [],
            animais_nao_alimentados_48_hrs: []
        };

        dashboard.animais_nao_alimentados_48_hrs = await animaisNaoAlimentados48hrs()
            .then(function (rows) {
                return rows;
            })
            .catch(err =>
                setImmediate(() => {
                    throw err;
                })
            );

        res.status(200).send(dashboard);
    });

/*******
 * ROTA PARA BUSCA DE ANIMAIS NÃO ALIMENTADOS NO DIA ATUAL
 * ****** */
Router.route('/nao-alimentados/hoje')

    .get(function (req, res, next) {
        var dashboard = {
            animais_nao_alimentados_hoje: [],
            count: []
        }

        var dataAtual = Moment().format('YYYY-MM-DD');
        poolQuery.getConnection((err, connection) => {
            connection.query(`SELECT 
                                animais.brinco AS brinco,
                                animais.id AS tb_animais_id,
                                chips.chip AS chip_num,
                                baias.nome AS nome_baia,
                                dietas.nome AS nome_dieta,
                                (SELECT 
                                        COUNT(id)
                                    FROM
                                        tb_animais
                                    WHERE
                                        tb_animais.excluido = 0
                                            AND tb_animais.tb_setor_tipo_id = 2
                                            AND tb_animais.calibracao = 0
                                            AND (SELECT 
                                                MAX(created)
                                            FROM
                                                tb_animais_movimentacoes
                                            WHERE
                                                tb_animais.id = tb_animais_movimentacoes.tb_animal_id) < '${dataAtual}') AS qtd_animais,
                                '0' AS qa,
                                '0' AS qr,
                                CASE
                                    WHEN
                                        (SELECT 
                                                qr
                                            FROM
                                                tb_dieta_dias
                                            WHERE
                                                tb_dietas_id = animais.tb_dieta_id
                                                    AND tb_dieta_dias.dia = DIA_ANIMAL(animais.id)
                                                    AND tb_dieta_dias.ativo = 1
                                            LIMIT 1) IS NULL
                                    THEN
                                        '--'
                                    WHEN
                                        (SELECT 
                                                qr
                                            FROM
                                                tb_dieta_dias
                                            WHERE
                                                tb_dietas_id = animais.tb_dieta_id
                                                    AND tb_dieta_dias.dia = DIA_ANIMAL(animais.id)
                                                    AND tb_dieta_dias.ativo = 1
                                            LIMIT 1) IS NOT NULL
                                    THEN
                                        (SELECT 
                                                qr
                                            FROM
                                                tb_dieta_dias
                                            WHERE
                                                tb_dietas_id = animais.tb_dieta_id
                                                    AND tb_dieta_dias.dia = DIA_ANIMAL(animais.id)
                                                    AND tb_dieta_dias.ativo = 1
                                            LIMIT 1)
                                END AS qt,
                                DIA_ANIMAL(animais.id) AS dia,
                                CASE
                                    WHEN
                                        ((SELECT 
                                                MAX(created)
                                            FROM
                                                tb_animais_registros
                                            WHERE
                                                tb_animais_registros.tb_animais_id = animais.id
                                                    AND DATE(created) < '${dataAtual}')) IS NULL
                                    THEN
                                        '--'
                                    WHEN
                                        ((SELECT 
                                                MAX(created)
                                            FROM
                                                tb_animais_registros
                                            WHERE
                                                tb_animais_registros.tb_animais_id = animais.id
                                                    AND DATE(created) < '${dataAtual}')) IS NOT NULL
                                    THEN
                                        (SELECT 
                                                MAX(created)
                                            FROM
                                                tb_animais_registros
                                            WHERE
                                                tb_animais_registros.tb_animais_id = animais.id
                                                    AND DATE(created) < '${dataAtual}')
                                END AS 'dosador_data'
                            FROM
                                tb_animais AS animais
                                    LEFT JOIN
                                tb_animais_registros AS registros ON animais.id = registros.tb_animais_id
                                    LEFT JOIN
                                tb_chips AS chips ON animais.chip = chips.id
                                    LEFT JOIN
                                tb_baias AS baias ON animais.baias_id = baias.id
                                    LEFT JOIN
                                tb_dietas AS dietas ON animais.tb_dieta_id = dietas.id
                                    LEFT JOIN
                                tb_animais_movimentacoes AS movimentacoes ON animais.id = movimentacoes.tb_animal_id
                                    LEFT JOIN
                                tb_dieta_dias AS dieta_dias ON animais.id = dieta_dias.id
                            WHERE
                                animais.excluido = 0
                                    AND animais.tb_setor_tipo_id = 2
                                    AND animais.calibracao = 0
                                    AND ((registros.qa = 0
                                    AND registros.dosador_data = '${dataAtual}')
                                    OR (animais.id NOT IN (SELECT 
                                        tb_animais_id
                                    FROM
                                        tb_animais_registros
                                    WHERE
                                        tb_animais_registros.dosador_data = '${dataAtual}')))
                                    AND (SELECT 
                                        MAX(created)
                                    FROM
                                        tb_animais_movimentacoes
                                    WHERE
                                        animais.id = tb_animais_movimentacoes.tb_animal_id) < '${dataAtual}'
                            GROUP BY animais.brinco, animais.id, chips.chip, baias.nome, dietas.nome`,
                (error, rows, fields) => {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        dashboard.animais_nao_alimentados_hoje = rows;
                        dashboard.count.push({ naoAlimentados: rows.length });
                        res.status(200).send(dashboard);
                    }
                });
        });
    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
