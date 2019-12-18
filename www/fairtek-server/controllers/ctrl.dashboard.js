/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express');
var Moment = require('../utils/moment');
var Router = express.Router();
_ = require('underscore');

/******************************************************************************************
MONGODB
******************************************************************************************/
var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);

/******************************************************************************************
 * 
 *****************************************************************************************/

/*
 * FUNCTION COM PROMISE
 */

function getAnimais() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais.id, tb_animais.brinco, tb_animais.tatuagem, tb_baias.id as baia_id, tb_baias.nome as baia_nome, tb_galpoes.nome as galpao_nome FROM fairtek.tb_animais as tb_animais LEFT JOIN tb_baias as tb_baias ON (tb_baias.id = tb_animais.baias_id) LEFT JOIN tb_galpoes as tb_galpoes ON (tb_galpoes.id = tb_baias.tb_galpoes_id) WHERE tb_animais.excluido <> 1 AND tb_animais.calibracao <> 1;`,
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


function totalAnimais() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_animais FROM tb_animais JOIN tb_chips ON tb_chips.id = tb_animais.chip WHERE tb_animais.excluido <> 1 and tb_animais.calibracao <> 1 AND tb_chips.ativo = 1`,
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

function totalAnimaisGestacao() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
            COUNT(*) AS total_animais_gestacao
        FROM
            tb_animais AS animais
        WHERE
            excluido <> 1 
            AND tb_setor_tipo_id = 2
            AND calibracao <> 1
            AND (SELECT MAX(created)
            FROM tb_animais_movimentacoes
            WHERE animais.id = tb_animais_movimentacoes.tb_animal_id) < DATE_ADD(CURDATE(), INTERVAL 0 DAY)`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                });
        });
    })
}

function totalAnimaisAlimentados(){
    return new Promise(function (resolve, reject) {
        var data = Moment();
        data = Moment(data).subtract(1, 'd');
        dataFormatada = Moment(data).format('YYYY-MM-DD');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_animais_alimentados FROM tb_animais_registros WHERE dosador_data = '${dataFormatada}' `,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                });
        });
    })
}

function totalAnimaisNaoAlimentados(){
    return new Promise(function (resolve, reject) {
        var data = Moment();
        dataOntem = Moment(data).subtract(1, 'd'); //ontem
        dataFormatadaOntem = Moment(dataOntem).format('YYYY-MM-DD'); 
        dataAnteontem =  Moment(data).subtract(2, 'd'); //anteontem
        dataFormatadaAnteontem = Moment(dataAnteontem).format('YYYY-MM-DD'); 


        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_animais_nao_alimentados FROM tb_animais_registros WHERE dosador_data <> '${dataFormatadaOntem}' and dosador_data > '${dataFormatadaAnteontem}' `,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                });
        });
    })
}

function totalDosadoresAtivos() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_baias_id, 
            (select count(id) FROM tb_dosadores WHERE excluido <> 1 AND ativo = 1) AS total_dosadores_ativos
            FROM tb_dosadores 
            WHERE excluido <> 1 and ativo = 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    if (rows.length == 0 ){
                        var total_dosadores_ativos = 0
                        rows.push(total_dosadores_ativos)
                    }
                    return resolve(rows);
                });
        });
    });
}

function totalDosadores() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_dosadores FROM tb_dosadores WHERE excluido <>  1 AND ativo = 1`,
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

function totalBaiasAtivos() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_baias_ativos 
                            FROM tb_baias
                                LEFT JOIN tb_galpoes as tb_galpoes on tb_baias.tb_galpoes_id = tb_galpoes.id
                                LEFT JOIN tb_granjas as tb_granjas on tb_galpoes.tb_granjas_id = tb_granjas.id
                            WHERE tb_galpoes.ativo <> 0 AND tb_granjas.ativo <> 0 AND tb_baias.excluido <> 1 AND tb_baias.ativo = 1;`,
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

function totalBaias() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_baias FROM tb_baias WHERE excluido <> 1`,
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

function totalGalpoesAtivos() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_galpoes_ativos FROM tb_galpoes WHERE excluido <> 1 and ativo = 1`,
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

function totalGalpoes() {
    return new Promise(function (resolve, reject) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT count(*) as total_galpoes FROM tb_galpoes WHERE excluido <> 1`,
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

async function animaisNaoAlimentados24hrs() {

    let animais = await getAnimais().then(function (rows) {
        return rows;
    }).catch((err) => setImmediate(() => {
        throw err;
    }));

    return new Promise(function (resolve, reject) {

        var data = Moment();

        data = Moment(data).subtract(1, 'd');

        dataFormatada = Moment(data).format('YYYY-MM-DD H:mm:ss');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_registros.id, tb_registros.tb_baias_id, tb_registros.tb_dosadores_id, tb_registros.tb_animais_id, tb_registros.qa, DATE_FORMAT(tb_registros.qa_data, '%Y-%m-%d %H:%i:%s') as qa_data, tb_registros.qr_dieta, tb_registros.nome_dieta, tb_registros.codigo_dieta, tb_registros.dia_animal FROM tb_registros as tb_registros WHERE tb_registros.excluido <> 1  AND tb_registros.qa_data >= '${dataFormatada}' group by tb_registros.tb_animais_id;`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    } else {

                        if (rows.length > 0) {
                            if (animais.length > 0) {
                                for (i = 0; i < animais.length; i++) {
                                    animais[i].comeu = 0;
                                    var list = _.where(rows, {
                                        'tb_animais_id': animais[i].id
                                    });
                                    if (list.length > 0) {
                                        animais[i].comeu = 1;
                                    }
                                }
                            }
                            animais = _.filter(animais, {
                                comeu: 0
                            })
                            return resolve(animais)
                        }
                        return resolve([]);
                    }
                });
        });
    });
}

async function animaisNaoAlimentados16hrs() {

    let animais = await getAnimais().then(function (rows) {
        return rows;
    }).catch((err) => setImmediate(() => {
        throw err;
    }));


    return new Promise(function (resolve, reject) {
        var data = Moment();

        data = Moment(data).subtract(16, 'h');

        dataFormatada = Moment(data).format('YYYY-MM-DD H:mm:ss');

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, tb_baias_id, tb_dosadores_id, tb_animais_id, qa, DATE_FORMAT(qa_data, '%Y-%m-%d %H:%i:%s') as qa_data, qr_dieta, nome_dieta, codigo_dieta, dia_animal  FROM tb_registros WHERE excluido <> 1  AND qa_data >= '${dataFormatada}'`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        return reject(error);
                    } else {

                        if (rows.length > 0) {
                            if (animais.length > 0) {
                                for (i = 0; i < animais.length; i++) {
                                    animais[i].comeu = 0;
                                    var list = _.where(rows, {
                                        'tb_animais_id': animais[i].id
                                    });
                                    if (list.length > 0) {
                                        animais[i].comeu = 1;
                                    }
                                }

                            }
                            animais = _.filter(animais, {
                                comeu: 0
                            })
                            return resolve(animais)
                        }
                        return resolve([]);
                    }

                });
        });
    });
}


/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/


Router.route('/')
    //LISTA 
    .get(async function (req, res, next) {

        var dashboard = {            
            total_animais: 0,
            total_animais_gestacao: 0,
            total_animais_alimentados: 0,
            total_animais_nao_alimentados: 0,
            total_dosadores_ativos: 0,
            total_dosadores: 0,
            total_baias_ativos: 0,
            total_baias: 0,
            total_galpoes_ativos: 0,
            total_galpoes: 0
        }

        dashboard.total_animais = await totalAnimais().then(function (rows) {
            return rows[0].total_animais;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_animais_gestacao = await totalAnimaisGestacao().then(function (rows) {
            return rows[0].total_animais_gestacao;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_animais_alimentados = await totalAnimaisAlimentados().then(function (rows) {
            return rows[0].total_animais_alimentados;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_animais_nao_alimentados = await totalAnimaisNaoAlimentados().then(function (rows) {
            return rows[0].total_animais_nao_alimentados;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_dosadores_ativos = await totalDosadoresAtivos().then(function (rows) {
            return rows[0].total_dosadores_ativos
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_dosadores = await totalDosadores().then(function (rows) {
            return rows[0].total_dosadores;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_baias_ativos = await totalBaiasAtivos().then(function (rows) {
            return rows[0].total_baias_ativos;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_baias = await totalBaias().then(function (rows) {
            return rows[0].total_baias;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_galpoes_ativos = await totalGalpoesAtivos().then(function (rows) {
            return rows[0].total_galpoes_ativos;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        dashboard.total_galpoes = await totalGalpoes().then(function (rows) {
            return rows[0].total_galpoes;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

        res.status(200).send(dashboard);

    });


/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;