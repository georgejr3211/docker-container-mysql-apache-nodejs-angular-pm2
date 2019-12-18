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

/******************************************************************************************
ROTA LIST(GET)
******************************************************************************************/
Router.route('/')
    .get(function (req, res, next) {
        var data = Moment().format('YYYY-MM-DD');
        dataOntem = Moment(data).subtract(1, 'd').format('YYYY-MM-DD');
        dataSemana = Moment(data).subtract(8, 'd').format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(
                `SELECT date_format(dosador_data, "%d-%m-%Y") as dosador_data, 
                    (select sum(qa) where dosador_data = dosador_data) as qa_total
                 FROM tb_animais_registros 
                 where dosador_data BETWEEN STR_TO_DATE('${dataSemana}', '%Y-%m-%d') AND STR_TO_DATE('${dataOntem}', '%Y-%m-%d')
                 group by dosador_data`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send(error)

                    }
                    else {
                        res.status(200).send(rows)
                    }

                })
        })


    });

/******************************************************************************************
ROTA COM PARÂMETROS DE INTERVALO
******************************************************************************************/
Router.route('/intervalo/data/:tipo/:dt_inicio/:dt_final')

    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            var tipo = req.params.tipo;
            var dt_inicio = req.params.dt_inicio;
            var dt_final = req.params.dt_final;
            switch (tipo) {
                case '1':
                    
                    // BUSCA DIÁRIO
                    connection.query(`SELECT date_format(dosador_data, "%d-%m-%Y") AS dosador_data, 
                                        (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_total
                                      FROM tb_animais_registros 
                                      WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')
                                      GROUP BY dosador_data
                                     ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data)`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)

                            }
                            else {
                                
                                res.status(200).send(rows)
                            }

                        })
                    break;
                case '2':
                    // BUSCA SEMANAL
                    connection.query(`SELECT DATE_FORMAT(dosador_data, "%d-%m-%Y") AS dosador_data,
                                        DATE_FORMAT(DATE_ADD( DATE(re.dosador_data), INTERVAL (7 - DAYOFWEEK( re.dosador_data )) DAY), "%d-%m-%Y") fim,
                                        (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_total, 'semana' as semana,
                                        CASE WHEN (dayofweek(dosador_data) = 1) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 0 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 2) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 1 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 3) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 2 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 4) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 3 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 5) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 4 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 6) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 5 DAY), "%d-%m-%Y")
                                            WHEN (dayofweek(dosador_data) = 7) THEN DATE_FORMAT(DATE_SUB(dosador_data, INTERVAL 6 DAY), "%d-%m-%Y")
                                        END AS 'primeiro_dia'
                                    FROM tb_animais_registros AS re 
                                    WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')                    
                                    GROUP BY primeiro_dia
                                    ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data) asc`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)
                            }
                            else {
                                res.status(200).send(rows)
                                }

                        })
                    break;
                case '3':
                   
                    // BUSCA QUINZENAL
                    connection.query(`SELECT CASE
                                        WHEN DAY(dosador_data) BETWEEN 1 AND 15 THEN 1 ELSE 2 END AS quinzena, 
                                        MONTHNAME(dosador_data) mes, YEAR(dosador_data) ano, (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_total,
                                            'quinzenal' as quinzenal
                                    FROM 
                                    tb_animais_registros AS re 
                                    WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')    
                                    GROUP BY
                                        CASE 
                                            WHEN DAY(dosador_data) BETWEEN 1 AND 15 THEN 1
                                            ELSE 2
                                        END, 
                                    MONTH(dosador_data), 
                                    YEAR(dosador_data)
                                    ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data)`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)
                                }
                                else {
                                var newArray = []
                                var quinzena;
                                for (var i = 0; i < rows.length; i++) {
                                    switch (rows[i].mes) {
                                        case 'January':
                                            rows[i].mes = 'Janeiro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'February':
                                            rows[i].mes = 'Fevereiro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'March':
                                            rows[i].mes = 'Março';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'April':
                                            rows[i].mes = 'Abril';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'May':
                                            rows[i].mes = 'Maio';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'June':
                                            rows[i].mes = 'Junho';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'July':
                                            rows[i].mes = 'Julho';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'August':
                                            rows[i].mes = 'Agosto';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'September':
                                            rows[i].mes = 'Setembro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'October':
                                            rows[i].mes = 'Outubro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'November':
                                            rows[i].mes = 'Novembro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                                            break;

                                        case 'December':
                                            rows[i].mes = 'Dezembro';
                                            quinzena = rows[i].quinzena+" quinz. / "+rows[i].mes+" / "+rows[i].ano;
                                            qa = rows[i].qa_total
                                            newArray.push({quinzena: quinzena, qa_total: qa, quinzenal: 'quinzenal'});
                            }
                                }
                                rows = newArray;
                                res.status(200).send(rows)
                            }

                        })
                    break;
                case '4':
                    
                    // BUSCA MENSAL
                    connection.query(`SELECT MONTHNAME(dosador_data) as mes, YEAR(dosador_data) as ano,                    
                                        (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_intervalo,
                                        CASE WHEN (MONTH(dosador_data) = 1) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 1 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 2) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 2 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 3) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 3 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 4) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 4 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 5) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 5 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 6) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 6 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 7) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 7 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 8) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 8 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 9) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 9 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 10) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 10 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 12) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 11 AND YEAR(dosador_data) = YEAR(dosador_data))
                                            WHEN (MONTH(dosador_data) = 11) THEN (SELECT SUM(qa) FROM tb_animais_registros WHERE MONTH(dosador_data) = 12 AND YEAR(dosador_data) = YEAR(dosador_data))
                                        END AS 'qa_total'
                                    FROM tb_animais_registros AS re 
                                    WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')                    
                                    GROUP BY MONTHNAME(dosador_data)
                                    ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data) ASC`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)
                            }
                            else {
                                var newArray = []
                                var mesAno;
                                for (var i = 0; i < rows.length; i++) {
                                    switch (rows[i].mes) {
                                        case 'January':
                                            rows[i].mes = 'Janeiro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'February':
                                            rows[i].mes = 'Fevereiro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'March':
                                            rows[i].mes = 'Março';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'April':
                                            rows[i].mes = 'Abril';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'May':
                                            rows[i].mes = 'Maio';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'June':
                                            rows[i].mes = 'Junho';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'July':
                                            rows[i].mes = 'Julho';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'August':
                                            rows[i].mes = 'Agosto';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'September':
                                            rows[i].mes = 'Setembro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'October':
                                            rows[i].mes = 'Outubro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'November':
                                            rows[i].mes = 'Novembro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                            break;

                                        case 'December':
                                            rows[i].mes = 'Dezembro';
                                            mesAno = rows[i].mes+" / "+rows[i].ano;
                                            newArray.push({mesAno: mesAno, qa_total: rows[i].qa_total, mensal: 'mes'});
                                    }
                                }
                                rows = newArray;
                                res.status(200).send(rows)
                            }

                        })
                    break;
                case '5':
                    // BUSCA SEMESTRAL
                    connection.query(`SELECT YEAR(dosador_data) ano, IF(MONTH(dosador_data) < 7, 1, 2) semestre, 
                                        (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_total
                                     FROM tb_animais_registros AS re 
                                     WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')                    
                                     GROUP BY ano, semestre
                                     ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data) ASC`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)
                            }
                            else {
                                var newArray = [];
                                for(var i = 0; i < rows.length; i++){
                                    semestre = rows[i].semestre+" semestre de "+rows[i].ano
                                    newArray.push({semestre: semestre, qa_total: rows[i].qa_total, semestral: "semestre"})
                                }
                                rows = newArray;
                                res.status(200).send(rows)
                            }

                        })
                    break;
                case '6':
                    // BUSCA ANUAL
                    connection.query(`SELECT YEAR(dosador_data) ano,
                                        (SELECT SUM(qa) WHERE dosador_data = dosador_data) AS qa_total, 'anual' as anual
                                        FROM tb_animais_registros AS re 
                                        WHERE dosador_data BETWEEN STR_TO_DATE('${dt_inicio}', '%Y-%m-%d') AND STR_TO_DATE('${dt_final}', '%Y-%m-%d')                    
                                        GROUP BY ano
                                        ORDER BY YEAR(dosador_data), MONTH(dosador_data), DAY(dosador_data) ASC`,
                        function (error, rows, fields) {
                            connection.release();
                            if (error) {
                                res.status(500).send(error)
                            }
                            else {
                                
                                res.status(200).send(rows)
                            }

                        })
                    break;
            }
        })

    });


module.exports = Router;