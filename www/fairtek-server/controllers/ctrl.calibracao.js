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
ROTA PRINCIPAL COM GET E POST
******************************************************************************************/

// PEGA TODOS OS REGISTROS DE CALIBRAÇÃO DOS DOSADORES
Router.route('/')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT  ca.id, ca.peso, ca.peso, ca.pta_antigo, ca.pta_novo, ca.tb_baia_id, ca.tb_setor_tipo_id, date_format(ca.created, "%d-%m-%Y") as created, chip.chip as num_chip
                              FROM tb_calibracao as ca
                                  LEFT JOIN tb_chips as chip ON ca.chip = chip.id
                              ORDER BY id DESC`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                });
        });


    })

    //CADASTRA ANIMAL DO TIPO CALIBRAÇÃO, RESPEITANDO TODOS OS PARÂMETROS NECESSÁRIOS PARA A COMUNICAÇÃO ENTRE O SISTEMA x AGENTE x DOSADORES
    .post(function (req, res, next) {
        var data = Moment();
        data = Moment(data).subtract(1, 'd');
        console.log('AQUIIIIIIIIIIIIIIIIIIIII', req.body);
        var CAMPOS = {
            rfid: req.body.chip,
            tatuagem: req.body.tatuagem,
            tb_dieta_id: 1,
            escore_id: 3,
            baias_id: req.body.baia,
            brinco: req.body.brinco,
            chip: req.body.chip,
            tempo_entre_dosagem: 5,
            ativo: 1,
            ag_update: 1,
            tb_setor_tipo_id: req.body.setor,
            //gestacao: 0,
            ciclo_animal: 0,
            calibracao: 1,
            updated: Moment(data).format('YYYY-MM-DD HH:mm:ss'),
            created: Moment(data).format('YYYY-MM-DD HH:mm:ss')
        };
        console.log(CAMPOS)

        poolQuery.getConnection(function (err, connection) {

            //VERIFICANDO SE ANIMAL JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_animais 
                              WHERE excluido = 0 AND ativo = 1 AND rfid = '${CAMPOS.rfid}' AND tatuagem = '${CAMPOS.tatuagem}' LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(400).send({ message: 'erro' });
                            connection.release();
                        }
                        //EXECUTA CADASTRO
                        else {
                            //VERIFICANDO SLOT DISPONIVEL
                            connection.query(`SELECT id FROM tb_rede WHERE status = 0 ORDER BY id ASC LIMIT 1`,
                                function (error, results, fields) {
                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        });
                                        connection.release();
                                    } else {
                                        if (results === []) {
                                            res.status(200).send({
                                                message: 'Nenhum registro na tb_rede, contate o administrador.'
                                            });
                                        }

                                        let ID_REDE = {
                                            id_rede: results[0].id
                                        };

                                        //CADASTRANDO ANIMAL
                                        connection.query(`INSERT INTO tb_animais SET ?, ?`, [CAMPOS, ID_REDE],
                                            function (error, results, fields) {

                                                if (error) {
                                                    console.log("error calibração: ", error);
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                    connection.release();
                                                }
                                                else {
                                                    //ATUALIZANDO CHIP 
                                                    connection.query(`UPDATE tb_chips SET ativo = 1 WHERE id = ? LIMIT 1`, [CAMPOS.chip],
                                                        function (error, results, fields) {

                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            }
                                                        });

                                                    //ATUALIZAR SLOT PARA ATIVO
                                                    var CAMPOS_SLOT = {
                                                        status: 1
                                                    };
                                                    connection.query(`UPDATE tb_rede SET ? WHERE id = ${ID_REDE.id_rede} LIMIT 1`, [CAMPOS_SLOT],
                                                        function (error, results, fields) {
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            } else {
                                                                //REALIZA A MOVIMENTAÇÃO DO ANIMAL
                                                                //VERIFICA QUAL É O ANIMAL
                                                                connection.query(`SELECT id FROM tb_animais WHERE created = ?  AND calibracao = ? LIMIT 1`, [CAMPOS.created, CAMPOS.calibracao],
                                                                    function (error, results, fields) {
                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            });
                                                                            connection.release();
                                                                        } else {
                                                                            //MOVIMENTA ANIMAL
                                                                            var CAMPOS_MOVIMENTACAO = {
                                                                                tb_animal_id: results[0].id,
                                                                                tb_baias_id: req.body.baia,
                                                                                tb_dieta_id: 1,
                                                                                tb_escore_id: 3,
                                                                                tb_setor_tipo_id: req.body.setor,
                                                                                tb_tempo_dosagem: 5,
                                                                                dt_movimentacao: Moment(data).format('YYYY-MM-DD HH:mm:ss'),
                                                                                dt_inseminacao: Moment(data).format('YYYY-MM-DD HH:mm:ss'),
                                                                                created: Moment(data).format('YYYY-MM-DD HH:mm:ss')
                                                                            };
                                                                            connection.query(`INSERT INTO tb_animais_movimentacoes SET ?`, [CAMPOS_MOVIMENTACAO],
                                                                                function (error, results, fields) {
                                                                                    if (error) {
                                                                                        console.log("error movimentação: ", error)
                                                                                        res.status(400).send({
                                                                                            message: error.message
                                                                                        });
                                                                                        connection.release();
                                                                                    } else {
                                                                                        //INSERE NOTIFICAÇÃO 
                                                                                        var CAMPOS_NOTIFICACAO = {
                                                                                            tb_notificacoes_tipos_id: 10,
                                                                                            valor: `{}`,
                                                                                            created: Moment(data).format('YYYY-MM-DD HH:mm:ss')
                                                                                        };
                                                                                        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                            function (error, results, fields) {
                                                                                                if (error) {
                                                                                                    res.status(400).send({ message: error.message });
                                                                                                }
                                                                                                else {
                                                                                                    res.status(200).send(
                                                                                                        {
                                                                                                            message: `Animal de calibração, cadastrado com sucesso!`
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        );

                                                                                    }
                                                                                });
                                                                        }

                                                                    })
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                });
                        }
                    }

                });

        });

    });

/******************************************************************************************
ROTA BUSCA ID ANIMAL ANIMAL CALIBRAÇÃO ATIVO
******************************************************************************************/
Router.route('/continua/calibra/busca')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT animais.*, chips.chip as numChip FROM tb_animais AS animais
            INNER JOIN tb_chips AS chips ON animais.chip = chips.id
            WHERE animais.excluido = 0 AND animais.ativo = 1 AND animais.calibracao = 1 ORDER BY animais.id DESC limit 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                });
        });


    })

/******************************************************************************************
ROTA BUSCA ID ANIMAL ANIMAL CALIBRAÇÃO ATIVO
******************************************************************************************/
Router.route('/calibra/busca/id')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais 
                              WHERE tb_setor_tipo_id = 2 AND calibracao = 1 AND ativo = 1 AND excluido = 0 ORDER BY id DESC limit 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                });
        });


    })

/******************************************************************************************
ROTA PARA COMPARAR QA E QT DO ANIMAL DA CALIBRAÇÃO
******************************************************************************************/
Router.route('/verifica/qa/qt/:id')
    .get(function (req, res, next) {
        var data = Moment().format('YYYY-MM-DD');
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT qa, qt FROM tb_animais_registros AS registro
                              WHERE tb_animais_id = ${req.params.id} AND dosador_data = '${data}'`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(204).send({ message: `Nenhum registro de dosagem encontrado, favor realizar a dosagem` })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                });
        });
    })

/******************************************************************************************
ROTA PARA BUSCAR O QA DO ANIMAL DE CALIBRAÇÃO
******************************************************************************************/
Router.route('/calibra/:id')
    .get(function (req, res, next) {
        var data = Moment().format('YYYY-MM-DD')
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT registro.qa, parametros.pTa 
                              FROM tb_animais_registros AS registro 
                                LEFT JOIN tb_eventos_parametros AS parametros ON parametros.tb_dosadores_id = registro.ult_dosador
                              WHERE tb_animais_id = ${req.params.id} AND dosador_data = '${data}'`,
                function (error, rows, fields) {
                    console.log('qa do animal de calibracao', rows);
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows)
                    }

                });
        });


    })

/******************************************************************************************
ROTA PARA DESATIVAR ANIMAL APÓS A CALIBRAÇÃO
******************************************************************************************/
Router.route('/desativa/animal/chip')

    .put(function (req, res) {
        var CAMPOS = {
            ag_update: 1,
            excluido: 1
        };
        var chip_animal = req.params.rfid


        poolQuery.getConnection(function (err, connection) {
            //BUSCA TODOS OS ANIMAIS DO TIPO CALIBRAÇÃO E QUE ESTEJAM ATIVOS NO SISTEMA
            connection.query(`SELECT id AS animal, id_rede AS rede, rfid AS chip
                        FROM tb_animais WHERE calibracao = 1 AND excluido = 0 AND ativo = 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {

                        //VERIFICA SE TODOS OS ANIMAIS E CHIPS DA CALIBRAÇÃO, JÁ FORAM DESATIVADOS
                        //SE SIM, TERMINA O PROCESSO AGORA
                        if (rows.length == 0) {
                            connection.release();
                            res.status(200).send({
                                message: `Nada`
                            })
                        } else {

                            if (rows.length > 1) {
                                //Cria 3 array com os respectivos valores: id dos animais, id dos chips, id da rede
                                var animaisCalibra = [];
                                var chipsCalibra = [];
                                var redeCalibra = [];
                                for (var i = 0; i < rows.length; i++) {
                                    animaisCalibra.push(rows[i].animal)
                                    chipsCalibra.push(rows[i].chip)
                                    redeCalibra.push(rows[i].rede)
                                }
                            } else {
                                //Cria 3 variaveis com os respectivos valores: id dos animais, id dos chips, id da rede
                                var animaisCalibra = rows[0].animal;
                                var chipsCalibra = rows[0].chip;
                                var redeCalibra = rows[0].rede;
                            }

                            //LIBERA CHIP
                            connection.query(`UPDATE tb_chips SET ativo = 0 WHERE id IN (${chipsCalibra})`,
                                function (error, rows, fields) {
                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        });
                                        connection.release();
                                    } else {
                                        //DESATIVA O(S) ANIMAL(IS)
                                        connection.query(`UPDATE tb_animais SET ? WHERE id IN (${animaisCalibra})`, CAMPOS,
                                            function (error, rows, fields) {
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                    connection.release();
                                                } else {
                                                    //ATUALIZANDO SLOT
                                                    var CAMPOS_SLOT = {
                                                        status: 0
                                                    };
                                                    connection.query(`UPDATE tb_rede SET ? WHERE id IN (${redeCalibra})`, CAMPOS_SLOT,
                                                        function (error, rows, fields) {
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            } else {
                                                                //GERANDO NOTIFICAÇÃO DE ALTERACAO DE ANIMAL
                                                                var CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 10,
                                                                    valor: `{}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, rows, fields) {
                                                                        connection.release();

                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            })
                                                                        } else {
                                                                            res.status(200).send({
                                                                                message: `O(s) chip(s) utilizados para realizar a caliberação, estão disponiveis!`
                                                                            })
                                                                        }
                                                                    })
                                                            }
                                                        })
                                                }
                                            })
                                    }
                                })
                        }
                    }
                })
        })
    })
/******************************************************************************************
ROTA CADASTRA CALIBRAÇÃO
******************************************************************************************/
Router.route('/cadastra/calibra/:chip/:peso/:ptaa/:ptan/:baia/:setor')
    .post(function (req, res, next) {
        console.log('PARAMS QUE CHEGA PARA CALIBRAR', req.params);
        var CAMPOS = {
            chip: req.params.chip,
            peso: req.params.peso,
            pta_antigo: req.params.ptaa,
            pta_novo: req.params.ptan,
            tb_baia_id: req.params.baia,
            tb_setor_tipo_id: req.params.setor,
            created: Moment().format('YYYY-MM-DD HH:mm:ss'),
            excluido: 0
        }
        console.log("CAMPOS PARA CADASTRAR NA CALIBRACAO: ", CAMPOS)
        poolQuery.getConnection(function (err, connection) {
            connection.query(`INSERT INTO tb_calibracao SET ?`, CAMPOS,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        console.log("error cadastro calibra: ", error)
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `Calibração resgistrada com sucesso!`
                        })

                    }

                });
        });


    })

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
