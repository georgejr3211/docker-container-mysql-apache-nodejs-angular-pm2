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

// /*
// * FUNCTION COM PROMISE
// */

// function getAnimais() {
//     return new Promise(function (resolve, reject) {
//         poolQuery.getConnection(function (err, connection) {
//             connection.query(`SELECT tb_animais.*, tb_animais_registros.qa as qt_alimentada, tb_animais registros.qt as qt_total tb_baias.nome as baia_nome, tb_dietas.nome as nome_dieta, tb_galpoes.nome as galpao_nome, (SELECT dia FROM tb_animais_registros WHERE tb_animais_id = tb_animais.id ORDER BY id DESC LIMIT 1) as ultimo_dia
//                                 FROM fairtek.tb_animais as tb_animais 
//                                 LEFT JOIN tb_baias as tb_baias ON (tb_baias.id = tb_animais.baias_id)
//                                 LEFT JOIN tb_dietas as tb_dietas ON (tb_dietas.id = tb_animais.tb_dieta_id)
//                                 LEFT JOIN tb_animais_registros as tb_animais_registros ON (td_animais_registros.tb_animais_id = tb_animais.id)
//                                 LEFT JOIN tb_galpoes as tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id) 
//                                 WHERE tb_animais.excluido <> 1 AND tb_animais.ativo = 1 ORDER BY tb_animais.id;`,
//                 function (error, rows, fields) {
//                     connection.release();
//                     if (error) {
//                         return reject(error);
//                     }
//                     return resolve(rows);
//                 });
//         });
//     });
// }


// async function animaisAlimentados24hrs() {

//     let animais = await getAnimais().then(function (rows) {
//         return rows;
//     }).catch((err) => setImmediate(() => {
//         throw err;
//     }));

//     return new Promise(function (resolve, reject) {

//         var data = Moment();

//         data = Moment(data).subtract(1, 'd');

//         dataFormatada = Moment(data).format('YYYY-MM-DD H:mm:ss');
//         
//         poolQuery.getConnection(function (err, connection) {
//             connection.query(`SELECT tb_registros.id, tb_registros.tb_baias_id, tb_registros.tb_dosadores_id, tb_registros.tb_animais_id, tb_registros.qa, DATE_FORMAT(tb_registros.qa_data, '%Y-%m-%d %H:%i:%s') as qa_data, tb_registros.qr_dieta, tb_registros.nome_dieta, tb_registros.codigo_dieta, tb_registros.dia_animal FROM tb_registros as tb_registros WHERE tb_registros.excluido <> 1  AND tb_registros.qa_data >= '${dataFormatada}' group by tb_registros.tb_animais_id;`,
//                 function (error, rows, fields) {
//                     connection.release();
//                     if (error) {
//                         return reject(error);
//                     } else {

//                         if (rows.length > 0) {
//                             if (animais.length > 0) {
//                                 for (i = 0; i < animais.length; i++) {
//                                     animais[i].comeu = 0;
//                                     var list = _.where(rows, {
//                                         'tb_animais_id': animais[i].id
//                                     });
//                                     if (list.length > 0) {
//                                         animais[i].comeu = 1;
//                                     }
//                                 }

//                             }
//                             animais = _.filter(animais, {
//                                 comeu: 1
//                             });
//                             return resolve(animais)
//                         }
//                         return resolve([]);
//                     }
//                 });
//         });
//     });
// }


/******************************************************************************************
    LISTA  TODOS OS ANIMAIS ALIMENTADOS
******************************************************************************************/
Router.route('/')

    // .get(async function (req, res, next) {

    //     var dashboard = {
    //         total_animais: 0,
    //         total_dosadores: 0,
    //         total_baias: 0,
    //         total_galpoes: 0,
    //         total_dosadores_inativos: 0,
    //         total_animais_gestacao: 0,
    //         animais_alimentados_24_hrs: []
    //     }

    //     dashboard.animais_alimentados_24_hrs = await animaisAlimentados24hrs().then(function (rows) {


    //         return rows;
    //     }).catch((err) => setImmediate(() => {
    //         throw err;
    //     }))
   
    //     res.status(200).send(dashboard);

    // });

    //LISTA
    .get(function (req, res, next) {
        var paginate = utilDB.paginate(req, res, next);

        var data = Moment();
        data = Moment(data).subtract(1, 'd');
        dataFormatada = Moment(data).format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, DATE_FORMAT(tb_animais_registros.dosador_data, '%d/%m/%Y') as dosador_data_formatada, tb_animais.chip as chip_id, tb_dosadores.tb_baias_id as id_ult_baia, tb_baias.nome as nome_baia,
                                tb_chips.chip as chip_num,  tb_animais.brinco as brinco, tb_dietas.nome as nome_dieta,  TIME_FORMAT(tb_animais_registros.updated, "%H:%i") AS hora_alimentado,
                                tb_dosadores.codigo AS dosador_num
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
                                WHERE  tb_animais_registros.dosador_data = '${dataFormatada}' AND tb_animais.calibracao = 0 AND tb_animais_registros.qa > 0
                                ORDER BY hora_alimentado DESC`,

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
        data = Moment(data).subtract(1, 'd');
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, tb_animais.chip as chip_id, (SELECT tb_baias_id FROM tb_dosadores WHERE tb_dosadores.id = tb_animais_registros.ult_dosador) as id_ult_baia,
                                (SELECT nome FROM tb_baias WHERE tb_baias.id = id_ult_baia) as nome_baia, tb_chips.chip as chip_num,  tb_animais.brinco as brinco, tb_dietas.nome as nome_dieta,
                                TIME_FORMAT(tb_animais_registros.updated, "%H:%i") AS hora_alimentado, tb_dosadores.codigo AS dosador_num
                              FROM tb_animais_registros as tb_animais_registros
                                LEFT JOIN tb_animais as tb_animais ON tb_animais.id = tb_animais_registros.tb_animais_id
                                LEFT JOIN tb_chips as tb_chips ON tb_chips.id = tb_animais.chip
                                LEFT JOIN tb_dietas as tb_dietas ON tb_dietas.id = tb_animais_registros.dieta_codigo
                                LEFT JOIN tb_dosadores as tb_dosadores ON tb_dosadores.id = tb_animais_registros.ult_dosador
                              WHERE  dosador_data = '${dataFormatada}' AND tb_animais_registros.qa < tb_animais_registros.qt AND tb_animais_registros.qa > 0  AND tb_animais.calibracao = 0
                              ORDER BY hora_alimentado DESC`,                 
                function(error, rows, fields){
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
        data = Moment(data).subtract(1, 'd');
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_registros.*, tb_animais.chip as chip_id, (SELECT tb_baias_id FROM tb_dosadores WHERE tb_dosadores.id = tb_animais_registros.ult_dosador) as id_ult_baia,
                                (SELECT nome FROM tb_baias WHERE tb_baias.id = id_ult_baia) as nome_baia, tb_chips.chip as chip_num,  tb_animais.brinco as brinco, tb_dietas.nome as nome_dieta,
                                TIME_FORMAT(tb_animais_registros.updated, "%H:%i") AS hora_alimentado, tb_dosadores.codigo AS dosador_num
                              FROM tb_animais_registros as tb_animais_registros
                                LEFT JOIN tb_animais as tb_animais ON tb_animais.id = tb_animais_registros.tb_animais_id
                                LEFT JOIN tb_chips as tb_chips ON tb_chips.id = tb_animais.chip
                                LEFT JOIN tb_dietas as tb_dietas ON tb_dietas.id = tb_animais_registros.dieta_codigo
                                LEFT JOIN tb_dosadores as tb_dosadores ON tb_dosadores.id = tb_animais_registros.ult_dosador
                              WHERE  dosador_data = '${dataFormatada}' AND tb_animais_registros.qa >= tb_animais_registros.qt AND tb_animais.calibracao = 0
                              ORDER BY hora_alimentado DESC`, 
                
                function(error, rows, fields){
                    connection.release();
                    if (error) { res.status(400).send({ message: error.message }) }
                    else {
                        console.log("completamente: ", rows)
                        if (rows.length > 0) { res.status(200).send((rows)) }
                        else { res.status(200).send([]) }
                    }
                }
            );

        })

    });
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;