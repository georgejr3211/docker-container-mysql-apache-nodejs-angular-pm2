/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
let express = require('express'),
    Moment = require('../utils/moment'),
    Router = express.Router(),
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config),
    utilDB = require('../utils/utilDB');

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')
    //LISTA
    .get((req, res, next) => {
        var paginate = utilDB.paginate(req, res, next);
        poolQuery.getConnection((err, connection) => {
            // connection.query(`SELECT tb_animais.*, tb_chips.chip, (SELECT count(*) FROM tb_animais WHERE excluido <> 1) as COUNT_LINHA FROM tb_animais as tb_animais left join tb_chips as tb_chips on tb_animais.chip = tb_chips.id
            //     WHERE tb_animais.excluido <> 1 and tb_chips.excluido <> 1 ORDER BY id DESC` + paginate,
            connection.query(`SELECT tb_animais.*,
                                tb_chips.chip,
                                (SELECT nome FROM tb_baias WHERE tb_animais.baias_id = tb_baias.id) AS nome_baia,
                                (SELECT count(*) FROM tb_animais WHERE excluido <> 1) as COUNT_LINHA,
                                tb_dietas.nome as nome_dieta, 
                                (SELECT count(*) FROM tb_dietas WHERE excluido <> 1) as COUNT_LINHA_DIETAS,
                                tb_animais.chip as id_chip, 
                                (SELECT count(*) FROM tb_animais WHERE excluido <> 1) as COUNT_LINHA_ANIMAIS_ID
                            FROM tb_animais as tb_animais 
                                LEFT JOIN tb_chips as tb_chips on tb_animais.chip = tb_chips.id
                                LEFT JOIN tb_dietas ON tb_animais.tb_dieta_id = tb_dietas.id
                            WHERE tb_animais.excluido <> 1 and tb_chips.excluido <> 1 AND tb_animais.calibracao <> 1 ORDER BY tb_animais.id DESC` + paginate,
                (error, rows, fields) => {
                    connection.release();
                    if (error) {
                        res.status(400).send({ message: error })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(utilDB.construirObjetoRetornoBD(rows))
                            //res.status(200).send(rows);
                        } else {
                            res.status(200).send([]);
                        }
                    }
                });
        });
    })

    //CADASTRA
    .post(function (req, res, next) {
        if (req.body.ativo) {
            req.body.ativo = 1
        } else {
            req.body.ativo = 0
        };
        var CAMPOS = {
            id_rede: 0,
            rfid: req.body.rfid,
            tatuagem: req.body.tatuagem,
            brinco: req.body.brinco,
            chip: req.body.chip,
            ativo: 0,
            ag_update: 0,
            tb_setor_tipo_id: 1,
            //gestacao: 0,
            ciclo_animal: 0,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE ANIMAL JA FOI CADASTRADO
            connection.query(`SELECT * FROM tb_animais WHERE excluido <> 1 AND ativo <> 0 AND calibracao <> 1
            AND rfid = '${CAMPOS.rfid}' OR tatuagem = '${CAMPOS.tatuagem}' OR brinco = '${CAMPOS.brinco}' LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        }
                        //EXECUTA CADASTRO
                        else {
                            console.log("Entrou aqui!");
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
                                        console.log("CAMPOS:", CAMPOS);
                                        //CADASTRANDO ANIMAL
                                        connection.query(`INSERT INTO tb_animais SET ?`, CAMPOS,
                                            function (error, results, fields) {
                                                if (error) {
                                                    console.log("error animais: ", error)
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
                                                                console.log("error chip: ", error)
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            }
                                                        });
                                                    //ATUALIZAR SLOT PARA ATIVO
                                                    /*var CAMPOS_SLOT = {
                                                        status: 1
                                                    };
                                                    connection.query(`UPDATE tb_rede SET ? WHERE id = ${ID_REDE.id_rede} LIMIT 1`, CAMPOS_SLOT,
                                                        function (error, results, fields) {
                                                            connection.release();
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });

                                                            } else {
                                                                //GERANDO NOTIFICAÇÃO DE ALTERACAO ANIMAL
                                                                var CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 10,
                                                                    valor: `{}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, results, fields) {
                                                                        connection.release();

                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            })
                                                                        } else {
                                                                            res.status(200).send({
                                                                                message: `O animal foi cadastrado com sucesso!`
                                                                            })

                                                                        }

                                                                    })

                                                            }

                                                        })*/
                                                    res.status(200).send({
                                                        message: `O animal foi cadastrado com sucesso!`,
                                                        id_animal: results.insertId
                                                    });
                                                }
                                            });
                                    }
                                });
                        }

                        // res.status(200).send({
                        //     message: `O animal foi cadastrado com sucesso!`
                        // })
                    }
                });
        });
    });

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/getid/:id/:id_rede?')
    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais WHERE excluido <> 1 AND  calibracao <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `O animal pesquisado não existe!`
                            });
                        }
                    }
                });
        });
    })

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            chip: req.body.chip,
            tatuagem: req.body.tatuagem,
            brinco: req.body.brinco,
            ag_update: 1,
            ativo: req.body.ativo,
            updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
        };
        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE JA EXISTE OS DADOS DE UPDATE EM ALGUM OUTRO ANIMAL
            connection.query(`SELECT * FROM tb_animais WHERE excluido <> 1 AND ativo <> 0 AND calibracao <> 1
             AND tatuagem = '${CAMPOS.tatuagem}' OR brinco = '${CAMPOS.brinco}' LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        } else {
                            connection.query(`UPDATE tb_animais SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                function (error, results, fields) {

                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        });
                                        connection.release();
                                    } else {
                                        //ATUALIZANDO CHIP 
                                        connection.query(`UPDATE tb_chips SET ativo = 1 WHERE id = ? LIMIT 1`, [CAMPOS.chip],
                                            function (error, results, fields) {
                                                connection.release();
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                }
                                            });

                                        //GERANDO NOTIFICAÇÃO DE ALTERACAO DE ANIMAL
                                        var CAMPOS_NOTIFICACAO = {
                                            tb_notificacoes_tipos_id: 10,
                                            valor: `{}`,
                                            created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                        };
                                        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                            function (error, results, fields) {
                                                connection.release();
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    });
                                                } else {
                                                    res.status(200).send({
                                                        message: `Os dados do animal foram atualizados com sucesso!`
                                                    });
                                                }
                                            });
                                    }
                                });
                        }
                    }
                });
        });
    })

    //DELETA
    .delete(function (req, res) {
        var CAMPOS = {
            ag_update: 1,
            excluido: 1
        };
        poolQuery.getConnection(function (err, connection) {
            //ATUALIZANDO ANIMAIS
            connection.query(`UPDATE tb_animais SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
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
                        connection.query(`UPDATE tb_rede SET ? WHERE id = ${req.params.id_rede}`, CAMPOS_SLOT,
                            function (error, results, fields) {
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
                                        function (error, results, fields) {
                                            connection.release();
                                            if (error) {
                                                res.status(400).send({
                                                    message: error.message
                                                })
                                            } else {
                                                res.status(200).send({
                                                    message: `O animal foi excluído com sucesso!`
                                                });
                                            }
                                        });
                                }
                            });
                    }
                });
        });
    });

/******************************************************************************************
ROTA ITEM (ID) - ATUALIZA OS DADOS DO ANIMAL, E TROCA O CHIP DO MESMO
******************************************************************************************/
Router.route('/atualiza/animal/chip/:id/')
    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            chip: req.body.chip,
            rfid: req.body.chip, //rfid igual ao id do chip
            tatuagem: req.body.tatuagem,
            brinco: req.body.brinco,
            id: req.body.id_animal,
            ag_update: 1
        };
        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE JA EXISTE OS DADOS DE UPDATE EM ALGUM OUTRO ANIMAL
            connection.query(`SELECT * FROM tb_animais WHERE id <> ${CAMPOS.id} AND excluido <> 1 AND ativo <> 0 AND calibracao <> 1
             AND (tatuagem = '${CAMPOS.tatuagem}' OR brinco = '${CAMPOS.brinco}') LIMIT 1`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: 'erro' });
                            connection.release();
                        } else {
                            connection.query(`SELECT chip FROM tb_animais WHERE id = '${req.params.id}'`,
                                function (error, results, fields) {
                                    if (error) {
                                        res.status(400).send({
                                            message: error.message
                                        });
                                        connection.release();
                                    }
                                    else {
                                        var old_chip = results[0].chip;
                                        connection.query(`UPDATE tb_animais SET ? WHERE chip like ?  AND id <> 0`, [CAMPOS, old_chip],
                                            function (error, results, fields) {
                                                if (error) {
                                                    res.status(400).send({
                                                        message: error.message
                                                    })
                                                    connection.release();
                                                } else {
                                                    connection.query(`UPDATE tb_chips SET ativo = 0 WHERE id = ? AND id <> 0`, [old_chip],
                                                        function (error, results, fields) {
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            }
                                                        });
                                                    connection.query(`UPDATE tb_chips SET ativo = 1 WHERE id = ? AND id <> 0`, [CAMPOS.chip],
                                                        function (error, results, fields) {
                                                            if (error) {
                                                                res.status(400).send({
                                                                    message: error.message
                                                                });
                                                                connection.release();
                                                            } else {
                                                                //ATUALIZANDO SLOT
                                                                // var CAMPOS_SLOT = {
                                                                //     status: 0
                                                                // };
                                                                // connection.query(`UPDATE tb_rede SET ? WHERE id = ${req.params.id_rede}`, CAMPOS_SLOT,
                                                                //     function (error, results, fields) {
                                                                //console.log("rede:", results)
                                                                // if (error) {
                                                                //     res.status(400).send({
                                                                //         message: error.message
                                                                //     });
                                                                //     connection.release();
                                                                // } //else {
                                                                //GERANDO NOTIFICAÇÃO DE ALTERACAO DE ANIMAL
                                                                var CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 10,
                                                                    valor: `{}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, results, fields) {
                                                                        connection.release();
                                                                        if (error) {
                                                                            res.status(400).send({
                                                                                message: error.message
                                                                            });
                                                                        } else {
                                                                            res.status(200).send({
                                                                                message: `O animal foi atualizado com sucesso!`
                                                                            });
                                                                        }
                                                                    })
                                                                //}
                                                                //})
                                                            }
                                                        });
                                                }
                                            }
                                        );
                                    }
                                });
                        }
                    }
                });
        });
    });

/******************************************************************************************
ROTA ITEM DESATIVA (ID)
******************************************************************************************/
Router.route('/desativar/:id/:rede')
    //ATUALIZA
    .put((req, res, next) => {
        let CAMPOS = {
            id_rede: 0,
            rfid: 0,
            chip: 0,
            ativo: 0,
            motivo: req.body.motivo,
            ag_update: 1,
            excluido: 1,
            dt_de: Moment(req.body.dt_de).format('YYYY-MM-DD HH:mm:ss'),
            animal_teste: 0
        };
        let chip_animal = req.body.rfid; // id do chip sempre é igual ao rfid do animal

        console.log('req.body', req.body);
        console.log(`ID REDE: ${req.params.rede}; ID ANIMAL: ${req.params.id}`);

        poolQuery.getConnection((err, connection) => {
            // let chip_desativado = req.body.chip;
            connection.query(`UPDATE tb_chips SET ativo = 0 WHERE id = ? LIMIT 1`, [chip_animal],
                (error, results, fields) => {
                    if (error) {
                        console.log('ERRO AO DESATIVAR CHIP DO ANIMAL TESTE.', error);
                        res.status(400).send({ message: error });
                        connection.release();
                    } else {
                        connection.query('SELECT brinco, animal_teste FROM tb_animais WHERE chip = ?', chip_animal, (error, rows, fields) => {
                            if (error) {
                                res.status(400).send({ message: error });
                                connection.release();
                            } else {
                                console.log('CONSULTA ANIMAL TESTE', rows);
                                let brinco = rows[0].brinco;
                                let animal_teste = rows[0].animal_teste;
                                console.log('BRINCO', brinco);
                                if (animal_teste == 1) {
                                    let CAMPOS_ANIMAL_TESTE = {
                                        id_rede: 0,
                                        rfid: 0,
                                        chip: 0,
                                        ativo: 0,
                                        motivo: req.body.motivo,
                                        ag_update: 1,
                                        excluido: 1,
                                        dt_de: Moment(req.body.dt_de).format('YYYY-MM-DD HH:mm:ss')
                                    };
                                    console.log('DESATIVANDO ANIMAL TESTE');
                                    connection.query(`UPDATE tb_animais SET ? WHERE brinco = '${brinco}' AND tb_setor_tipo_id = 1`, CAMPOS_ANIMAL_TESTE,
                                        (error, results, fields) => {
                                            if (error) {
                                                console.log('ERRO AO ATUALIZAR ANIMAL TESTE tb_animais.', error);
                                                res.status(400).send({ message: error });
                                                connection.release();
                                            } else {
                                                //ATUALIZANDO SLOT
                                                connection.query(`UPDATE tb_rede SET status = 0 WHERE id = ${req.params.rede}`,
                                                    (error, results, fields) => {
                                                        if (error) {
                                                            console.log('ERRO AO DESATIVAR ID REDE ANIMAL TESTE.', error);
                                                            res.status(400).send({ message: error });
                                                            connection.release();
                                                        } else {
                                                            //GERANDO NOTIFICAÇÃO DE ALTERACAO NO ANIMAL
                                                            let CAMPOS_NOTIFICACAO = {
                                                                tb_notificacoes_tipos_id: 10,
                                                                valor: `{}`,
                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                            };
                                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                (error, results, fields) => {
                                                                    connection.release();
                                                                    if (error) {
                                                                        console.log('ERRO AO INSERIR NOTIFICACAO.', error);
                                                                        res.status(400).send({ message: error });
                                                                    } else {
                                                                        res.status(200).send({ message: `O animal foi desativado!` });
                                                                    }
                                                                });
                                                        }
                                                    });
                                            }
                                        }
                                    );
                                } else {
                                    console.log('DESATIVANDO ANIMAL TESTE');
                                    connection.query(`UPDATE tb_animais SET ? WHERE id = ${req.params.id}`, CAMPOS,
                                        (error, results, fields) => {
                                            if (error) {
                                                res.status(400).send({ message: error });
                                                connection.release();
                                            } else {
                                                //ATUALIZANDO SLOT
                                                let CAMPOS_SLOT = {
                                                    status: 0
                                                };
                                                connection.query(`UPDATE tb_rede SET status = 0 WHERE id = ${req.params.rede}`,
                                                    (error, results, fields) => {
                                                        if (error) {
                                                            res.status(400).send({ message: error });
                                                            connection.release();
                                                        } else {
                                                            //GERANDO NOTIFICAÇÃO DE ALTERACAO NO ANIMAL
                                                            let CAMPOS_NOTIFICACAO = {
                                                                tb_notificacoes_tipos_id: 10,
                                                                valor: `{}`,
                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                            };
                                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                (error, results, fields) => {
                                                                    connection.release();
                                                                    if (error) {
                                                                        res.status(400).send({ message: error });
                                                                    } else {
                                                                        res.status(200).send({
                                                                            message: `O animal foi desativado!`
                                                                        });
                                                                    }
                                                                });
                                                        }
                                                    });
                                            }
                                        }
                                    );
                                }
                            }
                        })
                    }
                });
        });
    });

/******************************************************************************************
ROTA ITEM (ID) - DESATIVA O CHIP COM O ANIMAL
******************************************************************************************/
Router.route('/desativa/animal/chip')
    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            chip: req.body.chip,
            ativo: 0,
            gestacao: 0,
            motivo: req.body.motivo,
            dt_de: Moment(req.body.dt_de).format('YYYY-MM-DD HH:mm:ss'),
        };
        poolQuery.getConnection(function (err, connection) {

            connection.query(`UPDATE tb_chips SET ativo = 0 WHERE chip = ? LIMIT 1`, [CAMPOS.chip],
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        });
                        connection.release();
                    }

                });

            connection.query(`UPDATE tb_animais SET ? WHERE chip = ?`, [CAMPOS, CAMPOS.chip],
                function (error, results, fields) {

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        res.status(200).send({
                            message: `O animal foi desativado, e o chip está pronto para uso!`
                        })
                    }
                    connection.release();
                });

        });

    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')
    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, tatuagem, brinco FROM tb_animais WHERE excluido <> 1 AND calobracao <> 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `Não existem animais a serem exibidos!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO ANIMAIS MOVIMENTAÇÕES
******************************************************************************************/
Router.route('/movimentacao/extra/combo/:tb_setor')
    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais.*, tb_chips.chip, (SELECT count(*) FROM tb_animais WHERE excluido <> 1) AS COUNT_LINHA,
                                tb_dietas.nome AS nome_dieta, (SELECT count(*) FROM tb_dietas WHERE excluido <> 1) AS COUNT_LINHA_DIETAS
                             FROM tb_animais AS tb_animais 
                                LEFT JOIN tb_chips AS tb_chips ON tb_animais.chip = tb_chips.id
                                LEFT JOIN tb_dietas ON tb_animais.tb_dieta_id = tb_dietas.id 
                            WHERE tb_animais.excluido <> 1 AND tb_animais.calibracao <> 1 AND tb_chips.excluido <> 1 AND tb_setor_tipo_id <> ${req.params.tb_setor} ORDER BY id DESC`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `Não existem animais a serem exibidos!`
                            })
                        }
                    }
                });
        });
    })

// // Animais por Baia

// Router.route('/baia/:id')

//     //LISTA
//     .get(function (req, res, next) {

//         // poolQuery.getConnection(function (err, connection) {
//         //     connection.query(`SELECT 
//         //                             tba.rfid, tba.tatuagem, tbr.dia_animal, SUM(tbr.qa) as qa, 
//         //                             tbb.nome 
//         //                     FROM fairtek.tb_registros tbr 
//         //                             INNER JOIN fairtek.tb_baias tbb on tbb.id = tbr.tb_baias_id 
//         //                             INNER JOIN fairtek.tb_animais tba on tba.id = tbr.tb_animais_id 
//         //                     WHERE DATE(tbr.qa_data) = DATE(now()) 
//         //                             AND tbr.tb_baias_id = ${req.params.id} 
//         //                             AND tbr.excluido = 0 
//         //                     GROUP BY tba.rfid`,
//         //         function (error, rows, fields) {
//         //             connection.release();

//         //             if (error) {
//         //                 res.status(400).send({
//         //                     message: error.message
//         //                 })
//         //             } else {
//         //                 if (rows.length > 0) {
//         //                     res.status(200).send(rows)
//         //                 } else {
//         //                     res.status(200).send([])
//         //                 }
//         //             }

//         //         });
//         // });
//         poolQuery.getConnection(function (err, connection) {
//             var dataAtual = Moment().format('YYYY-MM-DD 00:00:00');
//             connection.query(`SELECT 
//                                 tb_animais.*,
//                                 IF(MAX(tb_animais_registros.dosador_data) = DATE(now()),tb_animais_registros.qa, 0) AS qa_animal,
//                                 tb_animais_registros.qt AS qt_animal,
//                                 MAX(tb_animais_registros.dia) AS dia_animal,
//                                 IF(MAX(tb_animais_registros.dosador_data) = DATE(now()),MAX(tb_animais_registros.dosador_data),null)
//                                 AS dosador_data,
//                                 tb_chips.chip AS chip_num
//                               FROM
//                                 tb_animais
//                                     LEFT JOIN
//                                 tb_animais_registros AS tb_animais_registros ON tb_animais.id = tb_animais_registros.tb_animais_id
//                                     LEFT JOIN
//                                 tb_chips AS tb_chips ON tb_animais.chip = tb_chips.id
//                               WHERE
//                                 baias_id =${req.params.id} AND tb_animais.excluido = 0 AND tb_animais.tb_setor_tipo_id = 2 AND tb_animais.created < '${dataAtual}'
//                               GROUP BY id;`,
//                 function (error, rows, fields) {
//                     connection.release();

//                     if (error) {
//                         res.status(400).send({
//                             message: error.message
//                         })
//                     } else {
//                         if (rows.length > 0) {
//                             res.status(200).send(rows)
//                         } else {
//                             res.status(200).send([])
//                         }
//                     }

//                 });
//         });

//     });

/******************************************************************************************
COMBO RETORNAR O SETOR DO ANIMAL
******************************************************************************************/
Router.route('/setor/:id')
    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais.*, tb_setores_tipos.id as nome_setor
                                FROM tb_animais as tb_animais 
                                    LEFT JOIN tb_setores_tipos as tb_setores_tipos
                                        ON tb_animais.tb_setor_tipo_id = tb_setores_tipos.id 
                                WHERE tb_animais.id = ${req.params.id}`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `Não existem animais a serem exibidos!`
                            })
                        }
                    }
                });
        });
    })

/******************************************************************************************
COMBO BUSCA DADOS DE ANIMAIS PELO CHIP
******************************************************************************************/
Router.route('/animal/:chip_id')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais WHERE chip = '${req.params.chip_id}'`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    }
                    else {
                        if (rows.length > 0) {
                            // console.log(rows);
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send([]);
                        }
                    }
                })
        })
    });

/******************************************************************************************
ROTA BUSCA ANIMAL PELO (ID)
******************************************************************************************/
Router.route('/getAnimal/:id/')
    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais.*, tb_chips.chip as chip_num, tb_baias.nome as baia_nome 
                            FROM tb_animais 
                            LEFT JOIN tb_chips 
                                ON tb_animais.chip = tb_chips.id
                            LEFT JOIN tb_baias
                                ON tb_animais.baias_id = tb_baias.id
                         WHERE tb_animais.excluido <> 1 AND tb_animais.calibracao <> 1 AND tb_animais.id = '${req.params.id}'`,

                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(400).send({
                                message: `O animal pesquisado não existe!`
                            })
                        }
                    }

                });
        });

    })

/******************************************************************************************
ROTA BUSCA HISTORICO DE ALIMENTAÇÃO DO ANIMAL 
******************************************************************************************/
Router.route('/historico/:id/:ciclo')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT DISTINCT tb_animais_registros.*, tb_baias.nome as baia_nome, tb_dietas.nome as nome_dieta 
                              FROM tb_animais_registros
                                LEFT JOIN tb_dietas
                                    ON tb_animais_registros.dieta_codigo = tb_dietas.id 
                                LEFT JOIN tb_dosadores
                                    ON tb_animais_registros.ult_dosador = tb_dosadores.id
                                LEFT JOIN tb_baias
                                    ON tb_dosadores.tb_baias_id = tb_baias.id
                              WHERE tb_animais_id = ${req.params.id} AND ciclo_animal = ${req.params.ciclo} ORDER BY dia DESC`,

                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(200).send([])
                        }
                    }

                });
        });

    })
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;