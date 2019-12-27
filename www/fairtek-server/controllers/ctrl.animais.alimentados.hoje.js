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

/*************************************************************************
 * FUNÇÃO PARA BUSCA DE ANIMAIS ALIMENTADOS/ACUMULADOS/PARCIALMENTE ALIMENTADOS NO DIA ATUAL - GRÁFICO NA DASHBOARD ANIMAIS ACUMULADOS NO DIA
 * ********************************************************************* */

/*************************************************************************
* ACUMULADOS ALIMENTADOS NO DIA ATUAL
* ********************************************************************* */
function getAcumuladoAnimaisALimentadosHoje() {
    return new Promise(function (resolve, reject) {
        var dia_acumulado = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        var dataAtual = Moment().format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            ID_ANIMAL,
            HORA_PARCIAL,
            HORA_COMPLET,
            DIA,
            (SELECT 
                    COUNT(id)
                FROM
                    tb_animais
                WHERE
                    tb_setor_tipo_id = 2 AND excluido = 0
                        AND ativo = 1
                        AND tb_animais.calibracao <> 1
                        AND (SELECT 
                            MAX(DATE(created))
                        FROM
                            tb_animais_movimentacoes
                        WHERE
                            tb_animal_id = tb_animais.id
                        LIMIT 1) < '${dataAtual}') AS qtd_gestacao
        FROM
            tb_alimentacao_dia
                INNER JOIN
            tb_animais tba ON tb_alimentacao_dia.ID_ANIMAL = tba.id
        WHERE
            DIA = DATE(NOW())
                AND tba.tb_setor_tipo_id = 2`,

                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject({ message: error.message });
                    }
                    else {
                        console.log(rows);
                        if (rows.length > 0) {
                            dia_acumulado[24] = rows[0].qtd_gestacao;
                            for (let row of rows) {
                                hora_parc = row.HORA_PARCIAL;
                                for (let i = hora_parc; i <= (dia_acumulado.length - 2); i++) {
                                    dia_acumulado[i] = dia_acumulado[i] + 1;
                                }
                            }
                            return resolve(dia_acumulado)
                        }
                        else {
                            return resolve([])
                        }
                    }
                }
            );

        })

    })
}

/*************************************************************************
 * PARCIALMENTE ALIMENTADOS NO DIA ATUAL
 * ********************************************************************* */
function getParcialmenteAnimaisALimentadosHoje() {
    return new Promise(function (resolve, reject) {
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        var dia_array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                ID_ANIMAL,
                                HORA_PARCIAL,
                                HORA_COMPLET,
                                DIA,
                                 (SELECT 
                                        COUNT(id)
                                    FROM
                                        tb_animais
                                    WHERE
                                        tb_setor_tipo_id = 2 AND excluido = 0
                                            AND ativo = 1
                                            AND tb_animais.calibracao <> 1
                                            AND (SELECT 
                                                MAX(DATE(created))
                                            FROM
                                                tb_animais_movimentacoes
                                            WHERE
                                                tb_animal_id = tb_animais.id
                                            LIMIT 1) < '${dataFormatada}') AS qtd_gestacao
                            FROM
                                tb_alimentacao_dia
                                    INNER JOIN
                                tb_animais tba ON tb_alimentacao_dia.ID_ANIMAL = tba.id
                            WHERE
                                DIA = DATE(NOW())
                                    AND tba.tb_setor_tipo_id = 2`,

                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject({ message: error.message });
                    }
                    else {
                        if (rows.length > 0) {
                            dia_array[24] = rows[0].qtd_gestacao;
                            for (let row of rows) {
                                hora_parc = row.HORA_PARCIAL;
                                hora_complet = row.HORA_COMPLET;
                                if (hora_complet != null) {
                                    for (var i = hora_parc; i < hora_complet; i++) {
                                        dia_array[i] = dia_array[i] + 1;
                                    }
                                }
                                else {
                                    for (var i = hora_parc; i <= (dia_array.length - 2); i++) { // (dia_array.length - 2) pois a ultima posicao é referente a quantidade de animais na gestacao
                                        dia_array[i] = dia_array[i] + 1;
                                    }
                                }
                            }
                            return resolve(dia_array)
                        }
                        else {
                            return resolve([])
                        }
                    }
                }
            );

        })

    })
}


/*************************************************************************
 * TOTALMENTE ALIMENTADOS NO DIA ATUAL
 * ********************************************************************* */
function getTotalmenteAnimaisALimentadosHoje() {
    return new Promise(function (resolve, reject) {
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            DISTINCT(registros.tb_animais_id),
            (SELECT 
                    HOUR((SELECT 
                                    qa_data
                                FROM
                                    tb_registros
                                WHERE
                                    tb_animais_id = registros.tb_animais_id
                                        AND DATE(qa_data) = DATE(NOW())
                                        AND qa > 0
                                ORDER BY id DESC
                                LIMIT 1))) AS hora,
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            tb_setor_tipo_id = 2 AND excluido = 0
                                AND ativo = 1
                                AND tb_animais.calibracao <> 1
                                AND (SELECT 
                                    MAX(DATE(created))
                                FROM
                                    tb_animais_movimentacoes
                                WHERE
                                    tb_animal_id = tb_animais.id
                                LIMIT 1) < '${dataFormatada}') AS qtd_gestacao
                FROM
                    tb_animais_registros AS registros
                        RIGHT JOIN
                    tb_animais ON registros.tb_animais_id = tb_animais.id
                WHERE
                    qa = qt
                        AND dosador_data = '${dataFormatada}'
                        AND tb_animais.tb_setor_tipo_id = 2
                        AND tb_animais.calibracao <> 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject({ message: error.message });
                    }
                    else {
                        if (rows.length > 0) {
                            var th1 = 0, th2 = 0, th3 = 0, th4 = 0, th5 = 0, th6 = 0, th7 = 0, th8 = 0, th9 = 0, th10 = 0, th11 = 0, th12 = 0, th13 = 0, th14 = 0, th15 = 0, th16 = 0, th17 = 0, th18 = 0, th19 = 0, th20 = 0, th21 = 0, th22 = 0, th23 = 0, th00 = 0;
                            for (var i = 0; i < rows.length; i++) {
                                switch (rows[i].hora) {
                                    case 1:
                                        th1 = th1 + 1;
                                        break;
                                    case 2:
                                        th2 = th2 + 1;
                                        break;
                                    case 3:
                                        th3 = th3 + 1;
                                        break;
                                    case 4:
                                        th4 = th4 + 1;
                                        break;
                                    case 5:
                                        th5 = th5 + 1;
                                        break;
                                    case 6:
                                        th6 = th6 + 1;
                                        break;
                                    case 7:
                                        th7 = th7 + 1;
                                        break;
                                    case 8:
                                        th8 = th8 + 1;
                                        break;
                                    case 9:
                                        th9 = th9 + 1;
                                        break;
                                    case 10:
                                        th10 = th10 + 1;
                                        break;
                                    case 11:
                                        th11 = th11 + 1;
                                        break;
                                    case 12:
                                        th12 = th12 + 1;
                                        break;
                                    case 13:
                                        th13 = th13 + 1;
                                        break;
                                    case 14:
                                        th14 = th14 + 1;
                                        break;
                                    case 15:
                                        th15 = th15 + 1;
                                        break;
                                    case 16:
                                        th16 = th16 + 1;
                                        break;
                                    case 17:
                                        th17 = th17 + 1;
                                        break;
                                    case 18:
                                        th18 = th18 + 1;
                                        break;
                                    case 19:
                                        th19 = th19 + 1;
                                        break;
                                    case 20:
                                        th20 = th20 + 1;
                                        break;
                                    case 21:
                                        th21 = th21 + 1;
                                        break;
                                    case 22:
                                        th22 = th22 + 1;
                                        break;
                                    case 23:
                                        th23 = th23 + 1;
                                        break;
                                    case 00:
                                        th00 = th00 + 1;
                                        break;
                                }
                            }
                            th1 = th1 + th00;
                            th2 = th2 + th1;
                            th3 = th3 + th2;
                            th4 = th4 + th3;
                            th5 = th5 + th4;
                            th6 = th6 + th5;
                            th7 = th7 + th6;
                            th8 = th8 + th7;
                            th9 = th9 + th8;
                            th10 = th10 + th9;
                            th11 = th11 + th10;
                            th12 = th12 + th11;
                            th13 = th13 + th12;
                            th14 = th14 + th13;
                            th15 = th15 + th14;
                            th16 = th16 + th15;
                            th17 = th17 + th16;
                            th18 = th18 + th17;
                            th19 = th19 + th18;
                            th20 = th20 + th19;
                            th21 = th21 + th20;
                            th22 = th22 + th21;
                            th23 = th23 + th22;
                            var newArray = [th00, th1, th2, th3, th4, th5, th6, th7, th8, th9, th10, th11, th12, th13, th14,
                                th15, th16, th17, th18, th19, th20, th21, th22, th23, rows[0].qtd_gestacao]
                            rows = newArray

                            return resolve(rows)
                        }
                        else {
                            return resolve([])
                        }


                    }
                }
            );

        })

    })
}
/*************************************************************************
 * FUNÇÃO BUSCA ANIMAIS ALIMENTADOS NO DIA ATUAL
 * ********************************************************************* */
function getAnimaisAlimentados() {
    return new Promise(function (resolve, reject) {
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT
                                DISTINCT(registros.tb_animais_id),
                                registros.qa AS qa_alimentada,
                                tbald.HORA_PARCIAL AS hora_inicio,
                                tbald.HORA_COMPLET AS hora_complet,
                                (SELECT
                                        COUNT(id)
                                    FROM
                                        tb_animais
                                    WHERE
                                        tb_setor_tipo_id = 2 AND excluido = 0
                                            AND ativo = 1
                                            AND tb_animais.calibracao <> 1) AS qtd_gestacao
                            FROM
                                tb_animais_registros AS registros
                                    INNER JOIN
                                tb_animais ON registros.tb_animais_id = tb_animais.id
                                    INNER JOIN
                                tb_alimentacao_dia tbald ON tbald.ID_ANIMAL = registros.tb_animais_id
                                    AND tbald.DIA = registros.dosador_data
                            WHERE
                                qa > 0
                                    AND dosador_data = '${dataFormatada}'
                                    AND tb_animais.tb_setor_tipo_id = 2
                                    AND tb_animais.calibracao <> 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject({ message: error.message })
                    }
                    else {
                        return resolve(rows);
                    }
                })
        })
    })
}

/*************************************************************************
 * FUNÇÃO BUSCA QUANTIDADE DE RAÇÃO ALIMENTADA POR HORA APENAS PELOS ANIMAIS NA GESTACAO
 * ********************************************************************* */
function getQtdRacaoHora() {
    return new Promise(function (resolve, reject) {
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT
                                SUM(tbr.qa) as qa_alimentada,
                                HOUR(tbr.qa_data) as HORA,
                                (
                                SELECT
                                    count(id)
                                from
                                    tb_animais
                                where
                                    tb_setor_tipo_id = 2
                                    AND excluido = 0
                                    AND ativo = 1
                                    AND tb_animais.calibracao <> 1) as qtd_gestacao
                            FROM
                                tb_registros as tbr
                            INNER JOIN tb_animais on
                                tbr.tb_animais_id = tb_animais.id
                            WHERE
                                tbr.qa > 0
                                AND DATE(qa_data) = DATE(NOW())
                                AND tb_animais.tb_setor_tipo_id = 2
                                AND tb_animais.calibracao <> 1
                            GROUP BY
                                HORA`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject({ message: error.message })
                    }
                    else {
                        return resolve(rows);
                    }
                })
        })
    })
}
/*************************************************************************
 * FUNÇÃO DE AQUISIÇÃO DA QUANTIDADE TOTAL DE RAÇÃO A SER ALIMENTADA NO DIA
 * ********************************************************************* */
function getQtRacao() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                    FORMAT(SUM(QT_TOTAL.qt_animal), 0) AS QT_TOTAL_RACAO
                                FROM
                                    (SELECT 
                                        tb_animais.id,
                                            (SELECT 
                                                dia
                                            FROM
                                                tb_animais_registros
                                            WHERE
                                                tb_animais_registros.tb_animais_id = tb_animais.id
                                            ORDER BY id DESC
                                            LIMIT 1) AS dia_animal,
                                            (SELECT 
                                                CASE WHEN (tb_animais.escore_id <> 0) THEN qr + ((select peso from tb_escores where id = tb_animais.escore_id) / 100)
                                                END AS 'qr'
                                            FROM
                                                tb_dieta_dias
                                            WHERE
                                                tb_animais.tb_dieta_id = tb_dieta_dias.tb_dietas_id
                                                AND ativo = 1
                                                AND excluido <> 1
                                                AND tb_dieta_dias.dia = dia_animal) AS qt_animal
                                FROM
                                    tb_animais
                                WHERE
                                    tb_animais.excluido = 0
                                        AND tb_animais.ativo = 1
                                        AND tb_animais.tb_setor_tipo_id = 2
                                        AND tb_animais.calibracao <> 1
                                        AND tb_animais.created < DATE(NOW())) QT_TOTAL`,
                async function (error, rows, fields) {
                    if (error) {
                        reject({ message: error.message })
                    }
                    else {
                        acumulado_alimentados = [];
                        qtdRacao_hora = [];
                        let Acumulado_alimentados = await getAnimaisAlimentados().then(
                            data => {
                                acumulado_alimentados = data;
                            }
                        );
                        let qtdRacao = await getQtdRacaoHora().then(
                            res => {
                                qtdRacao_hora = res;
                            }
                        );
                        var horas_array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (acumulado_alimentados.length > 0) {
                            horas_array[24] = acumulado_alimentados[0].qtd_gestacao;

                            for (let hora of qtdRacao_hora) {
                                for (var i = hora.HORA; i <= (horas_array.length - 2); i++) {
                                    horas_array[i] = horas_array[i] + (hora.qa_alimentada / rows[0].QT_TOTAL_RACAO) * 100;
                                }
                            }

                            resolve(horas_array);
                        }
                        else {
                            resolve([])
                        }
                    }
                })

        })

    })
}

/******************************************************************************************
    LISTA  TODOS OS ANIMAIS ALIMENTADOS
******************************************************************************************/
Router.route('/')

    //LISTA
    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);

        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, tb_animais.chip as chip_id,
                                tb_dosadores.tb_baias_id as id_ult_baia,
                                tb_baias.nome as nome_baia,
                                tb_chips.chip as chip_num,  tb_animais.brinco as brinco,
                                tb_dietas.nome as nome_dieta
                            FROM tb_animais_registros as tb_animais_registros
                                LEFT JOIN tb_animais as tb_animais ON 
                                    tb_animais.id = tb_animais_registros.tb_animais_id
                                LEFT JOIN tb_chips as tb_chips ON 	
                                    tb_chips.id = tb_animais.chip
                                LEFT JOIN tb_dietas as tb_dietas ON 
                                    tb_dietas.id = tb_animais_registros.dieta_codigo
                                LEFT JOIN tb_dosadores as tb_dosadores ON 
                                    tb_dosadores.id = tb_animais_registros.ult_dosador
                                INNER JOIN tb_baias as tb_baias ON
                                    tb_dosadores.tb_baias_id = tb_baias.id
                            WHERE  dosador_data = '${dataFormatada}' AND qa > 0 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.calibracao <> 1`,

                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send((rows)) }
                        else { res.status(200).send([]) }
                    }

                }
            );
        });

    })

Router.route('/parcialmente')


    /******************************************************************************************
       LISTA  TODOS OS ANIMAIS PARCIALMENTE ALIMENTADOS
   ******************************************************************************************/

    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, tb_animais.chip as chip_id, (SELECT tb_baias_id FROM tb_dosadores WHERE tb_dosadores.id = tb_animais_registros.ult_dosador) as id_ult_baia,
                                (SELECT nome FROM tb_baias WHERE tb_baias.id = id_ult_baia) as nome_baia, tb_chips.chip as chip_num,  tb_animais.brinco as brinco, tb_dietas.nome as nome_dieta
                            FROM tb_animais_registros as tb_animais_registros
                                    LEFT JOIN tb_animais as tb_animais ON tb_animais.id = tb_animais_registros.tb_animais_id
                                    LEFT JOIN tb_chips as tb_chips ON tb_chips.id = tb_animais.chip
                                    LEFT JOIN tb_dietas as tb_dietas ON tb_dietas.id = tb_animais_registros.dieta_codigo
                                    LEFT JOIN tb_dosadores as tb_dosadores ON tb_dosadores.id = tb_animais_registros.ult_dosador
                            WHERE  dosador_data = '${dataFormatada}' AND tb_animais_registros.qa < tb_animais_registros.qt
                                AND tb_animais_registros.qa > 0 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.calibracao <> 1`,

                function (error, rows, fields) {
                    connection.release();
                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send((rows)) }
                        else { res.status(200).send([]) }
                    }
                }
            );

        })
    });

/******************************************************************************************
    LISTA  TODOS OS ANIMAIS  COMPLETAMENTE ALIMENTADOS
******************************************************************************************/

Router.route('/completamente')

    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, tb_animais.chip as chip_id, (SELECT tb_baias_id FROM tb_dosadores WHERE tb_dosadores.id = tb_animais_registros.ult_dosador) as id_ult_baia,
                                (SELECT nome FROM tb_baias WHERE tb_baias.id = id_ult_baia) as nome_baia, tb_chips.chip as chip_num,  tb_animais.brinco as brinco, tb_dietas.nome as nome_dieta
                            FROM tb_animais_registros as tb_animais_registros
                                LEFT JOIN tb_animais as tb_animais ON tb_animais.id = tb_animais_registros.tb_animais_id
                                LEFT JOIN tb_chips as tb_chips ON tb_chips.id = tb_animais.chip
                                LEFT JOIN tb_dietas as tb_dietas ON tb_dietas.id = tb_animais_registros.dieta_codigo
                                LEFT JOIN tb_dosadores as tb_dosadores ON tb_dosadores.id = tb_animais_registros.ult_dosador
                            WHERE  dosador_data = '${dataFormatada}' AND tb_animais_registros.qa >= tb_animais_registros.qt AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.calibracao <> 1`,

                function (error, rows, fields) {
                    connection.release();
                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send((rows)) }
                        else { res.status(200).send([]) }
                    }
                }
            );

        })

    });

/******************************************************************************************
    LISTA  TODOS OS ANIMAIS NÃO ALIMENTADOS
******************************************************************************************/

Router.route('/nao-alimentados')
    //NÃO ESTÁ EM USO
    .get(function (req, res, next) {
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_id as id
                                FROM tb_animais_registros 
                             WHERE qa > 0 AND dosador_data = '${dataFormatada}'`,
                function (error, rows, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    }
                    else {
                        var animaisRegistros = [];
                        for (var i = 0; i < rows.length; i++) {
                            animaisRegistros.push(rows[i].id)
                        }
                        connection.query(`SELECT 
                                            DISTINCT(a.brinco),
                                            c.chip AS chip_num,
                                            d.nome AS nome_dieta,
                                            b.nome AS nome_baia,
                                            ar.dosador_data AS dosador_data,
                                            '' AS qa,
                                            (SELECT 
                                                    qr
                                                FROM
                                                    tb_dieta_dias
                                                WHERE
                                                    a.tb_dieta_id = dd.tb_dietas_id
                                                        AND ativo = 1
                                                        AND excluido = 0
                                                        AND dd.dia = dia
                                                LIMIT 1) AS qt,
                                            DATEDIFF(DATE(NOW()), am.dt_inseminacao) + 1 AS dias,
                                            a.id AS animais_id
                                        FROM
                                            tb_animais AS a
                                                LEFT JOIN
                                            tb_animais_registros AS ar ON a.id = ar.tb_animais_id
                                                LEFT JOIN
                                            tb_chips AS c ON a.chip = c.id
                                                LEFT JOIN
                                            tb_baias AS b ON a.baias_id = b.id
                                                LEFT JOIN
                                            tb_dietas AS d ON a.tb_dieta_id = d.id
                                                INNER JOIN
                                            tb_dosadores AS dos ON ar.ult_dosador = dos.id
                                                LEFT JOIN
                                            tb_dieta_dias AS dd ON a.tb_dieta_id = dd.tb_dietas_id
                                                LEFT JOIN
                                            tb_animais_movimentacoes AS am ON a.id = am.tb_animal_id
                                        WHERE
                                            a.id NOT IN ('${animaisRegistros}')
                                                AND dos.tb_baias_id = b.id
                                                AND a.excluido = 0
                                                AND a.ativo = 1
                                                AND a.tb_setor_tipo_id = 2
                                                AND a.calibracao <> 1
                                                AND a.created <= CURDATE()`,
                            function (error, results, fields) {

                                if (error) {
                                    res.status(400).send({
                                        message: error.message
                                    });
                                    connection.release();
                                } else {
                                    var animaisNaoAlimentadosRegistrados = [];
                                    for (var i = 0; i < results.length; i++) {
                                        animaisNaoAlimentadosRegistrados.push(results[i].animais_id)
                                    }
                                    if (animaisNaoAlimentadosRegistrados.length < 1 || animaisRegistros.length < 1) {
                                        res.status(200).send(results)
                                        connection.release();
                                    } else {
                                        connection.query(`SELECT 
                                        tb_animais.brinco AS brinco,
                                        tb_chips.chip AS chip_num,
                                        DIA_ANIMAL(tb_animais.id) AS dia_animal,
                                        tb_animais.id,
                                        tb_dietas.nome AS nome_dieta,
                                        tb_baias.nome AS nome_baia,
                                        '' AS qa,
                                        (SELECT 
                                                qr
                                            FROM
                                                tb_dieta_dias
                                            WHERE
                                                tb_animais.tb_dieta_id = tb_dieta_dias.tb_dietas_id
                                                    AND ativo = 1
                                                    AND excluido = 0
                                                    AND tb_dieta_dias.dia = dia
                                            LIMIT 1) AS qt
                                    FROM
                                        tb_animais AS tb_animais
                                            LEFT JOIN
                                        tb_chips AS tb_chips ON tb_chips.id = tb_animais.chip
                                            LEFT JOIN
                                        tb_dietas AS tb_dietas ON tb_dietas.id = tb_animais.tb_dieta_id
                                            LEFT JOIN
                                        tb_baias AS tb_baias ON tb_baias.id = tb_animais.baias_id
                                            LEFT JOIN
                                        tb_dieta_dias AS tb_dieta_dias ON tb_dieta_dias.tb_dietas_id = tb_animais.tb_dieta_id
                                    WHERE
                                        tb_animais.excluido = 0 
                                            AND tb_animais.ativo = 1
                                            AND tb_animais.tb_setor_tipo_id = 2
                                            AND tb_animais.calibracao <> 1
                                            AND tb_animais.created < CURDATE()
                                            AND a.id not in (${animaisNaoAlimentadosRegistrados})
                                            AND a.id not in (${animaisRegistros})
                                    GROUP BY brinco, chip_num, dia_animal, nome_dieta, nome_baia`,
                                            function (error, rows, fields) {
                                                connection.release();
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                } else {
                                                    var animaisNaoAlimentadosSemRegistro = results
                                                    for (var i = 0; i < rows.length; i++) {
                                                        animaisNaoAlimentadosSemRegistro.push(rows[i])
                                                    }
                                                    rows = animaisNaoAlimentadosSemRegistro;
                                                    res.status(200).send((rows))

                                                }
                                            });
                                    }
                                }
                            });
                    }
                })
        })
    });

/******************************************************************************************
    LISTA  GRÁFICO ANIMAIS ALIMENTADOS HOJE
******************************************************************************************/

Router.route('/grafico/dia')

    .get(async function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);
        var alimentacao = {
            completamente: [],
            parcialmente: [],
            geral: [],
            qt_total_racao: []

        }
        let Acumulado_alimentados = await getAcumuladoAnimaisALimentadosHoje().then(
            data => {
                alimentacao.geral = data;
            }
        );
        let completamente_alimentados = await getParcialmenteAnimaisALimentadosHoje().then(
            data2 => {
                alimentacao.parcialmente = data2;
            }
        )

        let totalmente_alimentados = await getTotalmenteAnimaisALimentadosHoje().then(
            data3 => {
                alimentacao.completamente = data3;
            }
        )
        let qt_total_racao = await getQtRacao().then(
            data4 => {
                alimentacao.qt_total_racao = data4;
            }
        );

        res.status(200).send(alimentacao)
    });

/******************************************************************************************
    LISTA  TODOS OS ANIMAIS ALIMENTADOS NOS ÚLTIMOS 10 DIAS
******************************************************************************************/

Router.route('/alimentados/dez/dias')

    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);
        var data = Moment();
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            COUNT(CASE
                WHEN registros.created >= DATE_ADD(CURDATE(), INTERVAL - 9 DAY) THEN registros.tb_animais_id
                ELSE NULL
            END) AS animais_alimentados,
            DATE_FORMAT(registros.dosador_data, '%d-%m-%Y') AS dosador_data,
            CASE
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL 0 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL 0 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL 0 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL 0 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 1 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 1 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 2 DAY)
                THEN
                 (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 2 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 2 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 2 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 3 DAY)
                THEN
                   (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 3 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 3 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 3 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 4 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 4 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 4 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 4 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 5 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 5 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 5 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 5 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 6 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 6 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 6 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 6 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 7 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 7 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 7 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 7 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 8 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 8 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 8 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 8 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
                WHEN
                    dosador_data = DATE_ADD(CURDATE(), INTERVAL - 9 DAY)
                THEN
                    (SELECT 
                            COUNT(id)
                        FROM
                            tb_animais
                        WHERE
                            calibracao <> 1
                                AND (tb_animais.excluido <> 1
                                OR (DATE(tb_animais.updated) > DATE_ADD(CURDATE(), INTERVAL - 9 DAY)))
                                AND (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) < DATE_ADD(CURDATE(), INTERVAL - 9 DAY)
                                ORDER BY sub_movimentacoes.id DESC
                                LIMIT 1) = 2 OR (SELECT 
                                    tb_setor_tipo_id
                                FROM
                                    tb_animais_movimentacoes AS sub_movimentacoes
                                WHERE
                                    sub_movimentacoes.tb_animal_id = tb_animais.id
                                        AND (select max(sub_movimentacoes.created)) = DATE_ADD(CURDATE(), INTERVAL - 9 DAY)
                                ORDER BY sub_movimentacoes.id DESC ) = 1)
            END AS qtd_gestacao
        FROM
            tb_animais_registros AS registros
                RIGHT JOIN
            tb_animais AS animais ON registros.tb_animais_id = animais.id
        WHERE
            qa > 0
                AND dosador_data BETWEEN DATE_SUB(CURDATE(), INTERVAL 9 DAY) AND CURDATE()
                AND animais.calibracao <> 1
        GROUP BY dosador_data
        ORDER BY UNIX_TIMESTAMP(dosador_data) DESC`,

                function (error, rows, fields) {
                    connection.release();
                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) {
                            var newArray = [];
                            var animais_alimentados;
                            for (var i = 0; i < rows.length; i++) {
                                animais_alimentados = (rows[i].animais_alimentados / rows[i].qtd_gestacao) * 100
                                animais_alimentados = Math.floor(animais_alimentados)
                                var obj = { animais_alimentados: animais_alimentados, dosador_data: rows[i].dosador_data, qtd_gestacao: rows[i].qtd_gestacao }
                                newArray.push(obj)
                            }
                            rows = newArray;
                            res.status(200).send((rows))
                        }
                        else {
                            res.status(200).send([])
                        }
                    }
                }
            );

        })

    });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;