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
Router.route('/:filtro')
    // LISTAGEM DE MOVIMENTAÇÕES
    .get((req, res, next) => {
        let paginate = utilDB.paginate(req, res, next);
        let filtro = prepareFiltroMovimentacoes(req.params.filtro);
        console.log('FILTRO ANIMAIS MOVIMENTAÇÕES:', filtro);
        console.log('PAGINATE:', paginate);
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_animais_movimentacoes.*, tb_animais.id as idAnimal, tb_animais.brinco, tb_chips.chip as chip,
                                tb_animais.tb_setor_tipo_id as setor_atual,
                                (SELECT COUNT(*) FROM tb_animais_movimentacoes) as COUNT_LINHA,
                                tb_dietas.nome as nome_dieta, 
                                tb_baias.nome as nome_baia,
                                tb_animais.ciclo_animal as alojamento
                            FROM tb_animais_movimentacoes as tb_animais_movimentacoes
                                LEFT JOIN tb_animais as tb_animais on tb_animais_movimentacoes.tb_animal_id = tb_animais.id
                                left join tb_chips as tb_chips on tb_chips.id = tb_animais.chip
                                LEFT JOIN tb_dietas on tb_animais_movimentacoes.tb_dieta_id = tb_dietas.id
                                LEFT JOIN tb_baias on tb_animais_movimentacoes.tb_baias_id = tb_baias.id
                            WHERE ` + filtro + ` AND tb_animais.calibracao <> 1 ORDER BY id DESC` + paginate,
                (error, rows, fields) => {
                    connection.release();
                    if (error) {
                        console.log('ERRO AO OBTER LISTA DE ANIMAIS MOVIMENTADOS.', error);
                        res.status(400).send({ message: error });
                    } else {
                        if (rows.length > 0) {
                            res.status(200).send(utilDB.construirObjetoRetornoBD(rows));
                        } else {
                            res.status(200).send({ message: "Não existe registro de movimentação animal." });
                        }
                    }
                });
        });
    })

    // MOVIMENTAR ANIMAL
    .post((req, res, next) => {
        console.log("ANIMAL PARA ATUALIZAR MOVIMENTACAO NA tb_animais:", req.body);
        let CAMPOS = {
            tb_animal_id: req.body.animal,
            tb_baias_id: req.body.tb_baias_id || null,
            tb_dieta_id: req.body.tb_dieta_id || null,
            tb_escore_id: req.body.tb_escore_id || null,
            tb_setor_tipo_id: req.body.tb_setor_tipo_id,
            tb_tempo_dosagem: req.body.tb_tempo_dosagem || null,
            dt_movimentacao: Moment().format('YYYY-MM-DD HH:mm:ss'),
            status: 1,
            // updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        console.log('CAMPOS', CAMPOS);
        let query_movimentacao = 'INSERT INTO tb_animais_movimentacoes SET ?';
        console.log('dt_inseminacao DO ANIMAL A SER MOVIMENTADO: ', req.body.dt_inseminacao);
        console.log('dia_porco DO ANIMAL A SER MOVIMENTADO: ', req.body.dia_porco);
        if (req.body.dt_inseminacao != undefined && req.body.dia_porco != undefined && req.body.tb_setor_tipo_id != 1) {
            let CAMPO_DT = {
                dt_inseminacao: Moment(req.body.dt_inseminacao).format('YYYY-MM-DD HH:mm:ss') || null,
                calendario_porco: req.body.dia_porco || null
            };
            console.log('CAMPO_DT', CAMPO_DT);
            // query = `INSERT INTO tb_animais_movimentacoes (tb_animal_id, tb_dieta_id, dt_inseminacao, calendario-porco, dt_movimentacao, tb_setor_tipo_id, tb_escore_id, tb_baias_id, tb_tempo_dosagem, created)
            //     VALUES  (${CAMPOS.tb_animal_id}, ${CAMPOS.tb_dieta_id}, '${CAMPO_DT.dt_inseminacao}', '${CAMPO_DT.calendario_porco}', '${CAMPOS.dt_movimentacao}', ${CAMPOS.tb_setor_tipo_id}, ${CAMPOS.tb_escore_id}, ${CAMPOS.tb_baias_id}, ${CAMPOS.tb_tempo_dosagem}, '${CAMPOS.created}' )`
            query_movimentacao = `INSERT INTO tb_animais_movimentacoes 
                        (tb_animal_id, 
                         tb_dieta_id, 
                         dt_inseminacao, 
                         calendario_porco, 
                         dt_movimentacao, 
                         tb_setor_tipo_id, 
                         tb_escore_id, 
                         tb_baias_id, 
                         tb_tempo_dosagem, 
                         created)
                    VALUES (${CAMPOS.tb_animal_id}, 
                            ${CAMPOS.tb_dieta_id}, 
                           '${CAMPO_DT.dt_inseminacao}', 
                           '${CAMPO_DT.calendario_porco}', 
                           '${CAMPOS.dt_movimentacao}', 
                            ${CAMPOS.tb_setor_tipo_id}, 
                            ${CAMPOS.tb_escore_id}, 
                            ${CAMPOS.tb_baias_id}, 
                            ${CAMPOS.tb_tempo_dosagem}, 
                           '${CAMPOS.created}')`
        } else if (req.body.tb_setor_tipo_id == 1) {
            query_movimentacao = `INSERT INTO tb_animais_movimentacoes 
            (tb_animal_id,
                tb_dieta_id,
                dt_movimentacao,
                tb_setor_tipo_id, 
                created)
                VALUES (${CAMPOS.tb_animal_id},
                    ${CAMPOS.tb_dieta_id},
                    '${CAMPOS.dt_movimentacao}',
                    ${CAMPOS.tb_setor_tipo_id}, 
                    '${CAMPOS.created}' )`
        } else {
            let CAMPO_DT = {
                dt_inseminacao: Moment(req.body.dt_inseminacao).format('YYYY-MM-DD HH:mm:ss') || null,
                calendario_porco: req.body.dia_porco || null
            };
            query_movimentacao = `INSERT INTO tb_animais_movimentacoes 
                        (tb_animal_id, 
                         tb_dieta_id, 
                         dt_inseminacao, 
                         calendario_porco, 
                         dt_movimentacao, 
                         tb_setor_tipo_id, 
                         tb_escore_id, 
                         tb_baias_id, 
                         tb_tempo_dosagem, 
                         created)
                    VALUES (${CAMPOS.tb_animal_id}, 
                            ${CAMPOS.tb_dieta_id}, 
                           '${CAMPO_DT.dt_inseminacao}', 
                           '${CAMPO_DT.calendario_porco}', 
                           '${CAMPOS.dt_movimentacao}', 
                            ${CAMPOS.tb_setor_tipo_id}, 
                            ${CAMPOS.tb_escore_id}, 
                            ${CAMPOS.tb_baias_id}, 
                            ${CAMPOS.tb_tempo_dosagem}, 
                           '${CAMPOS.created}')`
        }
        console.log('QUERY ELSE', query_movimentacao);

        poolQuery.getConnection((err, connection) => {
            // ************************************************* MOVIMENTAÇÃO PARA ÁREA EXTERNA
            if (CAMPOS.tb_setor_tipo_id == 1) {
                console.log("MOVENDO ANIMAL PARA O SETOR 1 - ÁREA EXTERNA");
                console.log('ANIMAL A SER MOVIDO PARA A ÁREA EXTERNA:', CAMPOS);
                query_update_animal_externa = `UPDATE tb_animais  
                                       SET 
                                        id_rede             = 0,
                                        baias_id            = 0,
                                        tb_setor_tipo_id 	= '${req.body.tb_setor_tipo_id}',
                                        updated				= NOW(),
                                        ag_update           = 1,
                                        ativo               = 0
                                       WHERE id = ${req.body.animal}`;

                connection.query(`SELECT id_rede AS id_rede, baias_id FROM tb_animais WHERE id = ? ORDER BY id DESC LIMIT 1`, CAMPOS.tb_animal_id,
                    (error, results, fields) => {
                        if (error) {
                            console.log(`ERRO AO OBTER id_rede E baias_id DO ANIMAL ID: ${CAMPOS.tb_animal_id}`, error)
                            res.status(400).send({ message: error });
                            connection.release();
                        } else {
                            let baia_antiga = results[0].baias_id;
                            let id_rede_antigo = results[0].id_rede;
                            if (id_rede_antigo != 0) {
                                console.log("MOVIMENTANDO PARA A AREA EXTERNA(SETOR ID 1):", results[0])
                                console.log("QUERY UPDATE ANIMAL tb_animais ÁREA EXTERNA: ", query_update_animal_externa)
                                connection.query(query_update_animal_externa, function (error, results1, fields) {
                                    if (error) {
                                        console.log("ERRO AO ATUALIZAR O ANIMAL tb_animais NA AREA EXTERNA! QUERY: ", error);
                                        connection.release();
                                        res.status(400).send({ message: error });
                                    }
                                    else {
                                        console.log("QUERY DE MOVIMENTACAO PARA A AREA EXTERNA tb_animais_movimentacoes: ", query_movimentacao)
                                        connection.query(query_movimentacao,
                                            function (error, results2, fields) {
                                                if (error) {
                                                    console.log("ERRO AO MOVIMENTAR O ANIMAL PARA A AREA EXTERNA: ", error)
                                                    connection.release();
                                                    res.status(400).send({ message: error });
                                                } else {
                                                    console.log(`ID DE REDE A SER DESATIVADO: ${id_rede_antigo}; BAIA ANTIGA: ${baia_antiga}`);
                                                    connection.query(`UPDATE tb_rede SET status = 0 WHERE id_rede = ? AND id_baia = ? LIMIT 1`, [id_rede_antigo, baia_antiga],
                                                        function (error, results3, fields) {
                                                            if (error) {
                                                                connection.release();
                                                                console.log("ERRO AO DESATIVAR ID DE REDE - ÁREA EXTERNA:", error)
                                                                res.status(400).send({
                                                                    message: error
                                                                });
                                                            } else {
                                                                let CAMPOS_NOTIFICACAO = {
                                                                    tb_notificacoes_tipos_id: 10,
                                                                    valor: `{"origem: ${results[0].baias_id}":"destino: ${CAMPOS.tb_baias_id}"}`,
                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                    function (error, results4, fields) {
                                                                        connection.release();
                                                                        if (error) {
                                                                            console.log("ERRO AO INSERIR NOTIFICAÇÕES DE MOVIMENTAÇÃO PARA ÁREA EXTERNA: ", error);
                                                                            res.status(400).send({ message: error });
                                                                        }
                                                                        else {
                                                                            res.status(200).send({ message: `Animal movimentado para a área externa com sucesso!` });
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        })
                                                }
                                            }
                                        );
                                    }
                                });
                            }
                            // else {
                            //     connection.query(query_update_animal, function (error, results, fields) {
                            //         //FAZER O INSERT DE NOTIFICACOES                            
                            //         if (error) {
                            //             console.log("error query update animal: ", query_update_animal_externa)
                            //             connection.release();
                            //             res.status(400).send({ message: error });
                            //         }
                            //         else {
                            //             connection.query(query,
                            //                 function (error, results1, fields) {
                            //                     if (error) {
                            //                         console.log("error query movimentações: ", query)
                            //                         connection.release();
                            //                         res.status(400).send({ message: error });
                            //                     } else {
                            //                         let CAMPOS_NOTIFICACAO = {
                            //                             tb_notificacoes_tipos_id: 10,
                            //                             valor: `{"origem: ${results[0].baias_id}":"destino: ${CAMPOS.tb_baias_id}"}`,
                            //                             created: Moment().format('YYYY-MM-DD HH:mm:ss')
                            //                         };
                            //                         connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                            //                             function (error, results2, fields) {
                            //                                 connection.release();
                            //                                 if (error) {
                            //                                     console.log("error insert notificações: ", error)
                            //                                     res.status(400).send({ message: error });
                            //                                 }
                            //                                 else {
                            //                                     res.status(200).send({ message: `Animal movimentado com sucesso!` });
                            //                                 }
                            //                             }
                            //                         );
                            //                     }
                            //                 }
                            //             );
                            //         }
                            //     });
                            // }
                        }
                    });
                // ************************************************* MOVIMENTAÇÃO PARA GESTAÇÃO
            } else if (CAMPOS.tb_setor_tipo_id == 2) {
                console.log("MOVENDO ANIMAL PARA O SETOR 2 - GESTAÇÃO");
                console.log('ANIMAL A SER MOVIDO PARA A GESTAÇÃO:', CAMPOS);
                query_update_animal_gestacao = `UPDATE tb_animais as tba, (SELECT sum(tb_animais.ciclo_animal + 1) as ciclo from tb_animais where id = ${req.body.animal}) as c 
                                       SET 
                                        tba.id_rede             = (SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = '${req.body.tb_baias_id}' ORDER BY id ASC LIMIT 1),
                                        tba.tb_dieta_id 	 	= '${req.body.tb_dieta_id}',
                                        tba.escore_id		 	= '${req.body.tb_escore_id}',
                                        tba.baias_id		 	= '${req.body.tb_baias_id}',
                                        tba.tb_setor_tipo_id 	= '${req.body.tb_setor_tipo_id}',
                                        tba.tempo_entre_dosagem = '${req.body.tb_tempo_dosagem}',
                                        tba.ciclo_animal 		= c.ciclo,
                                        tba.updated				= NOW(),
                                        tba.ag_update           = 1,
                                        tba.ativo               = 1
                                       WHERE tba.id = ${req.body.animal}`;
                connection.query(`SELECT id_rede AS id_rede, baias_id FROM tb_animais WHERE id = ? ORDER BY id DESC LIMIT 1`, CAMPOS.tb_animal_id,
                    (error, results, fields) => {
                        if (error) {
                            console.log(`ERRO AO OBTER id_rede E baias_id DO ANIMAL ID: ${CAMPOS.tb_animal_id}`, error)
                            res.status(400).send({ message: error });
                            connection.release();
                        } else {
                            let baia_antiga = results[0].baias_id;
                            let id_rede_antigo = results[0].id_rede;
                            console.log(`ID DE REDE A SER DESATIVADO: ${id_rede_antigo}; BAIA ANTIGA: ${baia_antiga}`);
                            if (id_rede_antigo != 0) {
                                connection.query(`UPDATE tb_rede SET status = 0 WHERE id_rede = ? AND id_baia = ? LIMIT 1`, [id_rede_antigo, baia_antiga],
                                    function (error, results1, fields) {
                                        if (error) {
                                            console.log("ERRO AO DESATIVAR ID DE REDE - GESTAÇÃO:", error)
                                            res.status(400).send({ message: error });
                                            connection.release();
                                        } else {
                                            // VERIFICANDO ID DE REDE DISPONÍVEL
                                            connection.query(`SELECT id FROM tb_rede WHERE status = 0 AND id_baia = ? ORDER BY id ASC LIMIT 1`, req.body.tb_baias_id,
                                                function (error, results2, fields) {
                                                    if (error) {
                                                        console.log(`ERRO AO OBTER O PRIMEIRO ID DE REDE NAO UTILIZADO NA BAIA ${req.body.tb_baias_id}`, error);
                                                        res.status(400).send({ message: error });
                                                        connection.release();
                                                    } else {
                                                        if (results2 === []) {
                                                            console.log(`NENHUM ID DE REDE DISPONÍVEL NA BAIA ${req.body.tb_baias_id}.`);
                                                            res.status(200).send({ message: `Nenhum id de rede disponível na baia ${req.body.tb_baias_id}. Contate o administrador.` });
                                                            connection.release();
                                                        } else {
                                                            let id_rede = results2[0].id;
                                                            console.log('INSERT MOVIMENTACAO ANIMAL GESTACAO tb_animais_movimentacoes.');
                                                            connection.query(query_movimentacao,
                                                                function (error, results, fields) {
                                                                    if (error) {
                                                                        console.log(`ERRO AO INSERIR MOVIMENTACAO GESTACAO NA TABELA tb_animais_movimentacoes; QUERY: ${query_movimentacao}`, error);
                                                                        res.status(400).send({ message: error });
                                                                        connection.release();
                                                                    } else {
                                                                        console.log('UPDATE MOVIMENTACAO ANIMAL GESTACAO tb_animais:', query_update_animal_gestacao);
                                                                        connection.query(query_update_animal_gestacao, function (error, results, fields) {
                                                                            //FAZER O INSERT DE NOTIFICACOES                            
                                                                            if (error) {
                                                                                console.log("ERRO AO ATUALIZAR AS INFORMACOES DE MOV. DO ANIMAL NA TABELA tb_animais:", error);
                                                                                res.status(400).send({ message: error });
                                                                                connection.release();
                                                                            } else {
                                                                                console.log(`ATIVANDO O NOVO ID DE REDE ${id_rede} NA BAIA ${req.body.tb_baias_id}`);
                                                                                connection.query(`UPDATE tb_rede SET status = 1 WHERE id = ? LIMIT 1`, id_rede,
                                                                                    function (error, results3, fields) {
                                                                                        if (error) {
                                                                                            console.log(`ERRO AO ATUALIZAR A TABELA tb_rede DO ANIMAL ${ID_REDE.id_rede} QUE FOI MOVIMENTADO PARA A GESTAÇÃO`, error);
                                                                                            res.status(400).send({ message: error });
                                                                                            connection.release();
                                                                                        } else {
                                                                                            var CAMPOS_NOTIFICACAO = {
                                                                                                tb_notificacoes_tipos_id: 10,
                                                                                                valor: `{}`,
                                                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                            };
                                                                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                                function (error, results, fields) {
                                                                                                    connection.release();
                                                                                                    if (error) {
                                                                                                        console.log("ERRO AO INSERIR NOTIFICAÇÕES DE MOVIMENTAÇÃO PARA A GESTAÇÃO: ", error);
                                                                                                        res.status(400).send({ message: error });
                                                                                                    }
                                                                                                    else {
                                                                                                        res.status(200).send({ message: `Animal movimentado para a gestação com sucesso!` });
                                                                                                    }
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                });
                                        }
                                    });
                            }
                            else {
                                // VERIFICANDO ID DE REDE DISPONÍVEL
                                connection.query(`SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = ? ORDER BY id ASC LIMIT 1`, req.body.tb_baias_id,
                                    (error, results, fields) => {
                                        if (error) {
                                            console.log(`ERRO AO OBTER O PRIMEIRO ID DE REDE NAO UTILIZADO NA BAIA ${req.body.tb_baias_id}`, error);
                                            res.status(400).send({ message: error });
                                            connection.release();
                                        } else {
                                            if (results === []) {
                                                res.status(200).send({ message: 'Nenhum registro na tb_rede, contate o administrador.' });
                                                connection.release();
                                            } else {
                                                let id_rede = results[0].id_rede;
                                                console.log('INSERT MOVIMENTACAO ANIMAL GESTACAO tb_animais_movimentacoes.');
                                                connection.query(query_movimentacao,
                                                    function (error, results, fields) {
                                                        if (error) {
                                                            console.log(`ERRO AO INSERIR MOVIMENTACAO GESTACAO NA TABELA tb_animais_movimentacoes; QUERY: ${query_movimentacao}`, error);
                                                            res.status(400).send({ message: error });
                                                            connection.release();
                                                        } else {
                                                            connection.query(query_update_animal_gestacao, (error, results, fields) => {
                                                                //FAZER O INSERT DE NOTIFICACOES                            
                                                                if (error) {
                                                                    console.log("ERRO AO ATUALIZAR AS INFORMACOES DE MOV. DO ANIMAL NA TABELA tb_animais:", error);
                                                                    res.status(400).send({ message: error });
                                                                    connection.release();
                                                                } else {
                                                                    console.log(`ATIVANDO O NOVO ID DE REDE ${id_rede} NA BAIA ${req.body.tb_baias_id}`);
                                                                    connection.query(`UPDATE tb_rede SET status = 1 WHERE id_baia = ? AND id_rede = ? LIMIT 1`, [req.body.tb_baias_id, id_rede],
                                                                        function (error, results3, fields) {
                                                                            if (error) {
                                                                                console.log(`ERRO AO ATUALIZAR A TABELA tb_rede DO ANIMAL ${ID_REDE.id_rede} QUE FOI MOVIMENTADO PARA A GESTAÇÃO`, error);
                                                                                res.status(400).send({
                                                                                    message: error
                                                                                });
                                                                                connection.release();
                                                                            } else {
                                                                                var CAMPOS_NOTIFICACAO = {
                                                                                    tb_notificacoes_tipos_id: 10,
                                                                                    valor: `{"origem: 0":"destino: ${CAMPOS.tb_baias_id}"}`,
                                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                };
                                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                    function (error, results, fields) {
                                                                                        connection.release();
                                                                                        if (error) {
                                                                                            console.log("ERRO AO INSERIR NOTIFICAÇÕES DE MOVIMENTAÇÃO PARA A GESTAÇÃO: ", error);
                                                                                            res.status(400).send({ message: error });
                                                                                        }
                                                                                        else {
                                                                                            res.status(200).send({ message: `Animal movimentado pra a gestação com sucesso!` });
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    )
                                                                }
                                                            });
                                                        }
                                                    }
                                                )
                                            }

                                        }
                                    });
                            }
                        }
                    });
                // ************************************************* MOVIMENTAÇÃO PARA A MATERNIDADE
            } else {
                console.log('MOVENDO ANIMAL PARA O SETOR 3 - MATERNIDADE');
                console.log('ANIMAL A SER MOVIDO PARA A MATERNIDADE:', CAMPOS);
                query_update_animal_maternidade = `UPDATE tb_animais as tba, (SELECT sum(tb_animais.ciclo_animal + 1) as ciclo from tb_animais where id = ${req.body.animal}) as c 
                                       SET 
                                        tba.id_rede             = (SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = '${req.body.tb_baias_id}' ORDER BY id ASC LIMIT 1),
                                        tba.tb_dieta_id 	 	= '${req.body.tb_dieta_id}',
                                        tba.escore_id		 	= '${req.body.tb_escore_id}',
                                        tba.baias_id		 	= '${req.body.tb_baias_id}',
                                        tba.tb_setor_tipo_id 	= '${req.body.tb_setor_tipo_id}',
                                        tba.tempo_entre_dosagem = '${req.body.tb_tempo_dosagem}',
                                        tba.ciclo_animal 		= c.ciclo,
                                        tba.updated				= NOW(),
                                        tba.ag_update           = 1,
                                        tba.ativo               = 1
                                       WHERE tba.id = ${req.body.animal}`;
                connection.query(`SELECT id_rede AS id_rede, baias_id FROM tb_animais WHERE id = ? ORDER BY id DESC LIMIT 1`, CAMPOS.tb_animal_id,
                    (error, results, fields) => {
                        if (error) {
                            console.log(`ERRO AO OBTER id_rede E baias_id DO ANIMAL ID: ${CAMPOS.tb_animal_id}`, error)
                            res.status(400).send({ message: error });
                            connection.release();
                        } else {
                            let baia_antiga = results[0].baias_id;
                            let id_rede_antigo = results[0].id_rede;
                            console.log(`ID DE REDE A SER DESATIVADO: ${id_rede_antigo}; BAIA ANTIGA: ${baia_antiga}`);
                            if (id_rede_antigo != 0) {
                                connection.query(`UPDATE tb_rede SET status = 0 WHERE id_rede = ? AND id_baia = ? LIMIT 1`, [id_rede_antigo, baia_antiga],
                                    function (error, results1, fields) {
                                        if (error) {
                                            console.log("ERRO AO DESATIVAR ID DE REDE - MATERNIDADE:", error)
                                            res.status(400).send({ message: error });
                                            connection.release();
                                        } else {
                                            // VERIFICANDO NOVO ID DE REDE DISPONÍVEL NA NOVA BAIA
                                            connection.query(`SELECT id FROM tb_rede WHERE status = 0 AND id_baia = ? ORDER BY id ASC LIMIT 1`, req.body.tb_baias_id,
                                                (error, results2, fields) => {
                                                    if (error) {
                                                        console.log(`ERRO AO OBTER O PRIMEIRO ID DE REDE NAO UTILIZADO NA BAIA ${req.body.tb_baias_id}`, error);
                                                        res.status(400).send({ message: error });
                                                        connection.release();
                                                    } else {
                                                        if (results2 === []) {
                                                            res.status(200).send({ message: 'Nenhum registro na tb_rede, contate o administrador.' });
                                                            connection.release();
                                                        } else {
                                                            let id_rede = results2[0].id;
                                                            console.log('QUERY MOVIMENTACAO ANIMAL PARA MATERNIDADE tb_animais_movimentacao', query_movimentacao);
                                                            connection.query(query_movimentacao,
                                                                function (error, results, fields) {
                                                                    if (error) {
                                                                        console.log(`ERRO AO INSERIR MOVIMENTACAO MATERNIDADE NA TABELA tb_animais_movimentacoes; QUERY: ${query_movimentacao}`, error);
                                                                        res.status(400).send({ message: error });
                                                                        connection.release();
                                                                    } else {
                                                                        console.log('INSERT UPDATE ANIMAL MATERNIDADE tb_animais', query_update_animal_maternidade);
                                                                        connection.query(query_update_animal_maternidade, (error, results, fields) => {
                                                                            //FAZER O INSERT DE NOTIFICACOES                            
                                                                            if (error) {
                                                                                console.log("ERRO AO ATUALIZAR AS INFORMACOES DE MOV. DO ANIMAL NA TABELA tb_animais:", error);
                                                                                res.status(400).send({ message: error });
                                                                                connection.release();
                                                                            } else {
                                                                                connection.query(`UPDATE tb_rede SET status = 1 WHERE id = ? LIMIT 1`, id_rede,
                                                                                    function (error, results3, fields) {
                                                                                        if (error) {
                                                                                            console.log(`ERRO AO ATIVAR ID DE REDE NA TABELA tb_rede DO ANIMAL ${ID_REDE.id_rede} QUE FOI MOVIMENTADO PARA A MATERNIDADE`, error);
                                                                                            res.status(400).send({ message: error });
                                                                                            connection.release();
                                                                                        } else {
                                                                                            var CAMPOS_NOTIFICACAO = {
                                                                                                tb_notificacoes_tipos_id: 10,
                                                                                                valor: `{}`,
                                                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                            };
                                                                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                                function (error, results, fields) {
                                                                                                    connection.release();
                                                                                                    if (error) {
                                                                                                        console.log("ERRO AO INSERIR NOTIFICAÇÕES DE MOVIMENTAÇÃO PARA A MATERNIDADE: ", error);
                                                                                                        res.status(400).send({ message: error });
                                                                                                    }
                                                                                                    else {
                                                                                                        res.status(200).send({ message: `Animal movimentado para a maternidade com sucesso!` });
                                                                                                    }
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                });
                                        }
                                    });
                            }
                            else {
                                console
                                // VERIFICANDO ID DE REDE DISPONÍVEL
                                connection.query(`SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = ? ORDER BY id ASC LIMIT 1`, req.body.tb_baias_id,
                                    function (error, results, fields) {
                                        if (error) {
                                            console.log(`ERRO AO OBTER O PRIMEIRO ID DE REDE NAO UTILIZADO NA BAIA ${req.body.tb_baias_id}`, error);
                                            res.status(400).send({ message: error });
                                            connection.release();
                                        } else {
                                            if (results === []) {
                                                res.status(200).send({ message: 'Nenhum registro na tb_rede, contate o administrador.' });
                                                connection.release();
                                            } else {
                                                let id_rede = results[0].id_rede;
                                                console.log('QUERY MOVIMENTACAO ANIMAL PARA MATERNIDADE tb_animais_movimentacao', query_movimentacao);
                                                connection.query(query_movimentacao,
                                                    function (error, results, fields) {
                                                        if (error) {
                                                            console.log(`ERRO AO INSERIR MOVIMENTACAO MATERNIDADE NA TABELA tb_animais_movimentacoes; QUERY: ${query_movimentacao}`, error);
                                                            res.status(400).send({ message: error });
                                                            connection.release();
                                                        } else {
                                                            console.log('INSERT UPDATE ANIMAL MATERNIDADE tb_animais', query_update_animal_maternidade);
                                                            connection.query(query_update_animal_maternidade, (error, results, fields) => {
                                                                //FAZER O INSERT DE NOTIFICACOES                            
                                                                if (error) {
                                                                    console.log("ERRO AO ATUALIZAR AS INFORMACOES DE MOV. DO ANIMAL NA TABELA tb_animais:", error);
                                                                    res.status(400).send({ message: error });
                                                                    connection.release();
                                                                } else {
                                                                    connection.query(`UPDATE tb_rede SET status = 1 WHERE id_baia = ? AND id_rede = ? LIMIT 1`, [req.body.tb_baias_id, id_rede],
                                                                        function (error, results3, fields) {
                                                                            if (error) {
                                                                                console.log(`ERRO AO ATIVAR ID DE REDE NA TABELA tb_rede DO ANIMAL ${ID_REDE.id_rede} QUE FOI MOVIMENTADO PARA A MATERNIDADE`, error);
                                                                                res.status(400).send({
                                                                                    message: error
                                                                                });
                                                                                connection.release();
                                                                            } else {
                                                                                var CAMPOS_NOTIFICACAO = {
                                                                                    tb_notificacoes_tipos_id: 10,
                                                                                    valor: `{"origem: 0":"destino: ${CAMPOS.tb_baias_id}"}`,
                                                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                };
                                                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                    function (error, results, fields) {
                                                                                        connection.release();
                                                                                        if (error) {
                                                                                            console.log("ERRO AO INSERIR NOTIFICAÇÕES DE MOVIMENTAÇÃO PARA A MATERNIDADE: ", error);
                                                                                            res.status(400).send({ message: error });
                                                                                        }
                                                                                        else {
                                                                                            res.status(200).send({ message: `Animal movimentado para a maternidade com sucesso!` });
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    )
                                                                }
                                                            });
                                                        }
                                                    }
                                                )
                                            }

                                        }
                                    });
                            }
                        }
                    });
            }
        }
        );
    });

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id')

    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais WHERE excluido <> 1 AND calibracao <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error
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

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            // tb_baias_id: req.body.tb_baias_id,
            tb_dieta_id: req.body.tb_dieta_id,
            tb_escore_id: req.body.tb_escore_id,
            tb_tempo_dosagem: req.body.tb_tempo_dosagem,
        };

        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_animais_movimentacoes SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results1, fields) {
                    if (error) {
                        res.status(400).send({
                            message: error
                        });
                        connection.release();
                    } else {
                        connection.query(`SELECT tb_animal_id FROM tb_animais_movimentacoes WHERE id = ${req.params.id}`,
                            function (error, results2, fields) {
                                if (error) {
                                    res.status(400).send({
                                        message: error
                                    });
                                    connection.release();
                                } else {
                                    var id_animal = results2[0].tb_animal_id;

                                    var CAMPOS_ANIMAIS = {
                                        //baias_id: req.body.tb_baias_id,
                                        tb_dieta_id: req.body.tb_dieta_id,
                                        escore_id: req.body.tb_escore_id,
                                        tempo_entre_dosagem: req.body.tb_tempo_dosagem,
                                        ag_update: 1
                                    };
                                    connection.query(`UPDATE tb_animais SET ? WHERE id = ${id_animal}`, CAMPOS_ANIMAIS,
                                        function (error, results3, fields) {
                                            if (error) {
                                                res.status(400).send({
                                                    message: error
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
                                                                message: error
                                                            })
                                                        } else {
                                                            res.status(200).send({
                                                                message: `Os dados do animal foram atualizados com sucesso!`
                                                            })

                                                        }

                                                    })
                                            }
                                        });
                                }
                            });
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
                            message: error
                        });
                        connection.release();
                    } else {
                        //ATUALIZANDO SLOT
                        var CAMPOS_SLOT = {
                            status: 0
                        };
                        // 
                        connection.query(`UPDATE tb_rede SET status = 0 WHERE id = ?`, req.params.id_rede,
                            (error, results, fields) => {
                                if (error) {
                                    res.status(400).send({
                                        message: error
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
                                                    message: error
                                                });
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
ROTA ITEM DESATIVA (ID)
******************************************************************************************/
//SELECIONA
Router.route('/desativar/:id')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_animais WHERE excluido <> 1 AND calibracao <> 1 AND id = ${req.params.id} LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error
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

    //ATUALIZA
    .put(function (req, res, next) {
        var CAMPOS = {
            rfid: req.body.rfid,
            //tatuagem: req.body.tatuagem,
            //brinco: req.body.brinco,
            //dt_ia: Moment(req.body.dt_ia).format('YYYY-MM-DD HH:mm:ss'),
            //dt_entrada: Moment(req.body.dt_entrada).format('YYYY-MM-DD HH:mm:ss'),
            //tempo_entre_dosagem: req.body.tempo_entre_dosagem,
            //baias_id: req.body.baias_id,
            //dieta_id: req.body.dieta_id,
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
                            message: error
                        });
                        connection.release();
                    }

                });

            connection.query(`UPDATE tb_animais SET ? WHERE id = ${req.params.id}`, CAMPOS,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error
                        })
                    } else {
                        res.status(200).send({
                            message: `O animal ${CAMPOS.rfid} foi desativado!`
                        })
                    }

                });

        });

    })

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO GRUPO DE ANIMAIS NA BAIA | CADASTRA GRUPO
******************************************************************************************/
//SELECIONA
Router.route('/extra/combo/grupo/:grupoBaia')
    .get(function (req, res, next) {
        poolQuery.getConnection((err, connection) => {
            // connection.query(`SELECT * FROM tb_animais_movimentacoes WHERE tb_baias_id = ${req.params.grupoBaia}`,
            //     function (error, rows, fields) {
            //         connection.release();
            //         if (error) {
            //             res.status(400).send({
            //                 message: error
            //             });
            //         } else {
            //             //BUSCANDO DADOS NA TABELA DE ANIMAIS (tb_animais)
            //             if (rows.length > 0) {
            //                 var arrAnimalId = [];
            //                 for (var i = 0; rows.length > i; i++) {
            //                     arrAnimalId.push(rows[i].tb_animal_id)
            //                 }
            //                 connection.query(`SELECT * FROM tb_animais WHERE id in (${arrAnimalId}) AND tb_setor_tipo_id = 2 AND ativo = 1 AND excluido <> 1`,
            //                     function (error, rows, fields) {
            //                         if (error) {
            //                             res.status(400).send({
            //                                 message: error
            //                             }
            //                         )
            //                         } else {
            //                             res.status(200).send(rows)
            //                         }
            //                     });
            //             } else {
            //                 res.status(400).send({
            //                     message: `Não existem animais a serem exibidos!`
            //                 })
            //             }
            //         }
            //     });
            connection.query(`SELECT * FROM tb_animais WHERE baias_id = ${req.params.grupoBaia} AND (tb_setor_tipo_id = 2 OR tb_setor_tipo_id = 3) AND ativo = 1 AND excluido = 0 AND calibracao <> 1 `,
                (error, rows, fields) => {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error
                        });
                    } else {
                        res.status(200).send(rows);
                    }
                });
        });
    });

/******************************
ROTA ITEM (ID) - CADASTRA GRUPO
******************************/
// MOVIMENTAR GRUPO DE ANIMAIS
Router.route('/extra/combo/cadastra/grupo')
    .post((req, res, next) => {
        console.log(req.body.comboGrupoBaia)
        let CAMPOS_MOVIMENTACAO = '';
        let IDS_REDE_ANTIGOS = [];
        for (let i = 0; i < req.body.comboGrupoBaia.length; i++) {
            CAMPOS_MOVIMENTACAO += `(${req.body.comboGrupoBaia[i].id}, '${Moment().format('YYYY-MM-DD HH:mm:ss')}', 1, '${Moment().format('YYYY-MM-DD HH:mm:ss')}'),`
            IDS_REDE_ANTIGOS.push(req.body.comboGrupoBaia[i].id_rede);
        }
        console.log('IDS_REDE_ANTIGOS', IDS_REDE_ANTIGOS);
        CAMPOS_MOVIMENTACAO = CAMPOS_MOVIMENTACAO.substring(0, CAMPOS_MOVIMENTACAO.length - 1);
        let query_movimentacao = `INSERT INTO tb_animais_movimentacoes (tb_animal_id, dt_movimentacao, tb_setor_tipo_id, created) VALUES ${CAMPOS_MOVIMENTACAO}`;
        poolQuery.getConnection((err, connection) => {
            if (err) {
                res.status(400).send({ message: err });
            } else {
                connection.query(query_movimentacao, (error, results, fields) => {
                    if (error) {
                        console.log('Erro ao movimentar o grupo de animais!', error);
                        connection.release();
                        res.status(400).send({ message: error });
                    }
                    else {
                        let baia_antiga = req.body.comboGrupoBaia[0].baias_id;
                        console.log(`IDS DE REDE A SEREM DESATIVADOS: ${IDS_REDE_ANTIGOS}; BAIA ANTIGA: ${baia_antiga}`);
                        connection.query(`UPDATE tb_rede SET status = 0 WHERE id_rede IN (?) AND id_baia = ?`, [IDS_REDE_ANTIGOS, baia_antiga],
                            (error, results3, fields) => {
                                if (error) {
                                    connection.release();
                                    console.log("ERRO AO DESATIVAR ID DE REDE - ÁREA EXTERNA:", error);
                                    res.status(400).send({
                                        message: error
                                    });
                                }
                                //UPDATE DOS DADOS DOS ANIMAIS NA TABELA tb_animais
                                let CAMPOS_ANIMAIS = {
                                    tb_setor_tipo_id: 1,
                                    ag_update: 1,
                                    updated: Moment().format('YYYY-MM-DD HH:mm:ss')
                                }
                                let IDS_ANIMAIS = '';
                                for (let i = 0; i < req.body.comboGrupoBaia.length; i++) {
                                    IDS_ANIMAIS += `${req.body.comboGrupoBaia[i].id.toString()},`
                                }
                                IDS_ANIMAIS = "(" + IDS_ANIMAIS.substring(0, IDS_ANIMAIS.length - 1) + ")";
                                connection.query(`UPDATE tb_animais SET ? WHERE id IN ${IDS_ANIMAIS}`, CAMPOS_ANIMAIS,
                                    (error, results, fields) => {
                                        //FAZER O INSERT DE NOTIFICACOES
                                        if (error) {
                                            res.status(400).send({ message: error });
                                        }
                                        else {
                                            let CAMPOS_NOTIFICACAO = {
                                                tb_notificacoes_tipos_id: 10,
                                                valor: `{}`,
                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                            };
                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                (error, results, fields) => {
                                                    if (error) {
                                                        res.status(400).send({ message: error });
                                                    }
                                                    else {
                                                        res.status(200).send({ message: `Animais transferidos com sucesso!` });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    }
                });
            }
        });
    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
//SELECIONA
Router.route('/extra/combo')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, tatuagem FROM tb_animais WHERE excluido <> 1 calibracao <> 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).send({
                            message: error
                        })
                    } else {
                        console.log('ANIMAIS:', rows);
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
    });

// Animais por Baia
Router.route('/baia/:id')
    //LISTA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                tb_animais.rfid,
                                tb_animais.tatuagem,
                                tb_registros.dia_animal,
                                SUM(tb_registros.qa) AS qa,
                                tb_baias.nome
                            FROM
                                tb_registros AS tb_registros
                                    INNER JOIN
                                tb_baias AS tb_baias ON tb_baias.id = tb_registros.tb_baias_id
                                    INNER JOIN
                                tb_animais tb_animais ON tb_animais.id = tb_registros.tb_animais_id
                            WHERE
                                DATE(tb_registros.qa_data) = DATE(NOW())
                                    AND tb_registros.tb_baias_id = ${req.params.id}
                                    AND tb_registros.excluido = 0
                                GROUP BY tb_animais.rfid,
                                        tb_animais.tatuagem,
                                        tb_registros.dia_animal,
                                        tb_baias.nome`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error
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
    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/post/animal_teste')
    // MOVIMENTA UM ANIMAL DO TIPO TESTE
    .post((req, res, next) => {
        // console.log('ANIMAL PARA CADASTRAR MOVIMENTACAO TESTE', req.body);
        console.log("SETOR TESTE: ", req.body.tb_setor_tipo_id)
        let FIELDS = {
            tb_animal_id: req.body.animal,
            tb_baias_id: req.body.tb_baias_id,
            tb_dieta_id: req.body.tb_dieta_id,
            tb_escore_id: req.body.tb_escore_id,
            tb_setor_tipo_id: req.body.tb_setor_tipo_id,
            tb_tempo_dosagem: req.body.tb_tempo_dosagem,
            dt_movimentacao: Moment().format('YYYY-MM-DD HH:mm:ss'),
            status: 1,
            created: Moment().format('YYYY-MM-DD HH:mm:ss')
        };
        console.log('FIELDS TEST', FIELDS);
        let today = Moment().format('YYYY-MM-DD HH:mm:ss');
        yesterday = Moment(today).subtract(1, 'd').format('YYYY-MM-DD HH:mm:ss');

        poolQuery.getConnection((err, connection) => {
            // BUSCA TODAS AS BAIAS CADASTRADAS NO SISTEMA (VERIFICAR ALTERAÇÃO NO CADASTRO DE BAIA)
            connection.query(`SELECT id AS id_baias FROM tb_baias`,
                (error, resultsBaias, fields) => {
                    if (error) {
                        console.log("ERRO AO BUSCAR BAIAS CADASTRADAS:", error);
                        res.status(400).send({ message: error });
                        connection.release();
                    } else {
                        console.log('resultsBaias', resultsBaias);
                        let baias = resultsBaias;
                        // PEGA O CHIP DO ANIMAL SELECIONADO PARA A CRIAÇÃO DOS ANIMAIS DE TESTES 
                        connection.query(`SELECT chip AS id_chip FROM tb_animais WHERE id = ?`, FIELDS.tb_animal_id,
                            (error, resultsChip, fields) => {
                                if (error) {
                                    console.log('resultsChip', resultsChip);
                                    console.log("ERRO AO BUSCAR CHIP DO ANIMAL A SER MOVIMENTADO PARA O SETOR TESTE:", error);
                                    res.status(400).send({ message: error });
                                    connection.release();
                                } else {
                                    // BUSCA OS PRIMEIROS IDS DE REDE LIVRES EM TODAS AS BAIAS PARA OS ANIMAIS DE TESTE
                                    connection.query(`SELECT id, id_baia FROM tb_rede WHERE status = 0 AND id_baia IN (SELECT id AS id_baias FROM tb_baias) GROUP BY id_baia ORDER BY id ASC`,
                                        (errorIdRede, rows, fields) => {
                                            if (errorIdRede) {
                                                console.log("ERRO AO BUSCAR IDS DE REDE LIVRES EM CADA BAIA: ", errorIdRede);
                                                res.status(400).send({ message: errorIdRede });
                                                connection.release();
                                            } else {
                                                // ATIVANDO ID DE REDE QUE SERA USADO PELOS ANIMAIS DE TESTE
                                                console.log("ROWS IDS REDE LIVRES", rows);
                                                let id_tb_rede = [];
                                                for (let i = 0; i < rows.length; i++) {
                                                    id_tb_rede.push(rows[i].id);
                                                }
                                                console.log('id_tb_rede', id_tb_rede);
                                                connection.query(`UPDATE tb_rede SET status = 1 WHERE id IN (${id_tb_rede})`,
                                                    (error, rows, fields) => {
                                                        if (error) {
                                                            console.log(`ERRO AO ATIVAR OS IDS DE REDE: ${id_tb_rede}`, error);
                                                            res.status(400).send({ message: error });
                                                            connection.release();
                                                        } else {
                                                            // ATUALIZANDO O ANIMAL SELECIONADO NA TABELA tb_animais
                                                            let animal_teste = `animalTeste${resultsChip[0].id_chip}`;
                                                            console.log(`ATUALIZANDO O ANIMAL TIPO TESTE COM ID: ${FIELDS.tb_animal_id} NA BAIA `);
                                                            connection.query(`UPDATE tb_animais SET 
                                                                    id_rede = (SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = ? LIMIT 1), 
                                                                    tb_dieta_id = ?, 
                                                                    tatuagem = ?, 
                                                                    brinco = ?, 
                                                                    tempo_entre_dosagem = ?, 
                                                                    rfid = ?, 
                                                                    baias_id = ?, 
                                                                    ativo = 1, 
                                                                    updated = DATE(NOW()), 
                                                                    ag_update = 1, 
                                                                    escore_id = ?, 
                                                                    chip = ?, 
                                                                    tb_setor_tipo_id = 2, 
                                                                    animal_teste = 1 
                                                                WHERE id = ?`,
                                                                [baias[0].id_baias,
                                                                FIELDS.tb_dieta_id,
                                                                    animal_teste,
                                                                    animal_teste,
                                                                FIELDS.tb_tempo_dosagem,
                                                                resultsChip[0].id_chip,
                                                                baias[0].id_baias,
                                                                FIELDS.tb_escore_id,
                                                                resultsChip[0].id_chip,
                                                                FIELDS.tb_animal_id],
                                                                (error, results2, fields) => {
                                                                    if (error) {
                                                                        console.log("ERRO AO ATUALIZAR OS DADOS DO ANIMAL NA TABELA tb_animais", error);
                                                                        res.status(400).send({ message: error });
                                                                        connection.release();
                                                                    } else {
                                                                        //QUERY PARA INSERÇÃO DOS DEMAIS ANIMAIS DO TIPO TESTE
                                                                        const forloop = baias.length;
                                                                        console.log('NUMERO DE BAIAS: ', forloop);
                                                                        let queryInsertAnimais = `INSERT INTO 
                                                                                                            tb_animais
                                                                                                                (id_rede, 
                                                                                                                tb_dieta_id, 
                                                                                                                rfid, 
                                                                                                                tatuagem, 
                                                                                                                brinco, 
                                                                                                                tempo_entre_dosagem, 
                                                                                                                baias_id, 
                                                                                                                ativo, 
                                                                                                                updated, 
                                                                                                                created, 
                                                                                                                excluido, 
                                                                                                                ag_update, 
                                                                                                                escore_id, 
                                                                                                                chip, 
                                                                                                                tb_setor_tipo_id, 
                                                                                                                ciclo_animal, 
                                                                                                                calibracao, 
                                                                                                                animal_teste) 
                                                                                                            VALUES
                                                                                                                ((SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = ${baias[1].id_baias} LIMIT 1), 
                                                                                                                ${FIELDS.tb_dieta_id}, 
                                                                                                                ${resultsChip[0].id_chip},
                                                                                                                '${animal_teste}', 
                                                                                                                '${animal_teste}', 
                                                                                                                ${FIELDS.tb_tempo_dosagem}, 
                                                                                                                ${baias[1].id_baias}, 
                                                                                                                1, 
                                                                                                                DATE(NOW()), 
                                                                                                                DATE(NOW()), 
                                                                                                                0, 
                                                                                                                1,
                                                                                                                ${FIELDS.tb_escore_id}, 
                                                                                                                ${resultsChip[0].id_chip}, 
                                                                                                                2, 
                                                                                                                0, 
                                                                                                                0, 
                                                                                                                1)`;
                                                                        for (let i = 2; i < forloop; i++) {
                                                                            console.log('Quantas voltas?', i);
                                                                            queryInsertAnimais += `, ((SELECT id_rede FROM tb_rede WHERE status = 0 AND id_baia = ${baias[i].id_baias} LIMIT 1), 
                                                                                                         ${FIELDS.tb_dieta_id}, 
                                                                                                         ${resultsChip[0].id_chip}, 
                                                                                                         '${animal_teste}', 
                                                                                                         '${animal_teste}', 
                                                                                                         ${FIELDS.tb_tempo_dosagem}, 
                                                                                                         ${baias[i].id_baias}, 
                                                                                                         1, 
                                                                                                         DATE(NOW()), 
                                                                                                         DATE(NOW()), 
                                                                                                         0, 
                                                                                                         1,
                                                                                                         ${FIELDS.tb_escore_id}, 
                                                                                                         ${resultsChip[0].id_chip}, 
                                                                                                         2, 
                                                                                                         0, 
                                                                                                         0, 
                                                                                                         1)`
                                                                        }
                                                                        console.log('queryInsertAnimais', queryInsertAnimais);
                                                                        connection.query(queryInsertAnimais,
                                                                            (error, results3, fields) => {
                                                                                if (error) {
                                                                                    console.log("ERRO AO INSERIR O(S) ANIMAIS TESTE NA TABELA tb_animais:", error);
                                                                                    res.status(400).send({ message: error });
                                                                                    connection.release();
                                                                                } else {
                                                                                    //BUSCA O ID DOS ANIMAIS DE TESTE     
                                                                                    connection.query(`SELECT id FROM tb_animais WHERE brinco = ? AND animal_teste = 1 ORDER BY id ASC`, animal_teste,
                                                                                        (error, resultsAnimaisTeste, fields) => {
                                                                                            if (error) {
                                                                                                console.log("ERRO AO OBTER O ID DOS ANIMAIS TIPO TESTE:", error);
                                                                                                res.status(400).send({ message: error });
                                                                                                connection.release();
                                                                                            } else {
                                                                                                console.log('resultsAnimaisTeste', resultsAnimaisTeste);
                                                                                                //MOVIMENTAÇÃO DOS ANIMAIS CADASTRADOS  
                                                                                                let queryInsertMovimentacao = `INSERT INTO tb_animais_movimentacoes (tb_animal_id, tb_dieta_id, dt_inseminacao, dt_movimentacao,
                                                                                                tb_setor_tipo_id, tb_escore_id, tb_baias_id, tb_tempo_dosagem, created) VALUES
                                                                                                (${resultsAnimaisTeste[0].id}, ${FIELDS.tb_dieta_id}, '${yesterday}', '${yesterday}', ${FIELDS.tb_setor_tipo_id}, ${FIELDS.tb_escore_id}, 
                                                                                                ${baias[0].id_baias}, ${FIELDS.tb_tempo_dosagem}, '${FIELDS.created}')`
                                                                                                for (let i = 1; i < forloop; i++) {
                                                                                                    if (i !== forloop - 1) {
                                                                                                        console.log(`VOLTA ${i}`)
                                                                                                        console.log(`ID: ${resultsAnimaisTeste[i].id}; BAIA: ${baias[i].id_baias} `);
                                                                                                        queryInsertMovimentacao += `, (${resultsAnimaisTeste[i].id}, ${FIELDS.tb_dieta_id}, '${yesterday}', '${yesterday}', 
                                                                                                        ${FIELDS.tb_setor_tipo_id}, ${FIELDS.tb_escore_id}, ${baias[i].id_baias}, ${FIELDS.tb_tempo_dosagem}, '${FIELDS.created}')`
                                                                                                    }
                                                                                                }
                                                                                                console.log('queryInsertMovimentacao', queryInsertMovimentacao);
                                                                                                connection.query(queryInsertMovimentacao,
                                                                                                    (error, results5, fields) => {
                                                                                                        if (error) {
                                                                                                            console.log("ERRO AO MOVIMENTAR O ANIMAL.", error);
                                                                                                            res.status(400).send({ message: error });
                                                                                                            connection.release();
                                                                                                        } else {
                                                                                                            var CAMPOS_NOTIFICACAO = {
                                                                                                                tb_notificacoes_tipos_id: 10,
                                                                                                                valor: `{}`,
                                                                                                                created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                                                                            };
                                                                                                            connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                                                                                function (error, results, fields) {
                                                                                                                    if (error) {
                                                                                                                        console.log("ERRO AO GRAVAR NOTIFICAÇÃO.", error);
                                                                                                                        connection.release();
                                                                                                                        res.status(400).send({ message: error });
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        connection.release();
                                                                                                                        res.status(200).send({ message: `Animal movimentado para o setor de teste com sucesso!` });
                                                                                                                    }
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    });
                                                                                            }
                                                                                        });
                                                                                }
                                                                            })
                                                                    }
                                                                })
                                                        }
                                                    })
                                            }
                                        })
                                }
                            });
                    }
                });
        });
    });

/******************************************************************************************
Utils Functions
******************************************************************************************/
function prepareFiltroMovimentacoes(option) {
    let filtro = ['1 = 1', 'tb_animais.excluido = 0', 'tb_animais.excluido = 1']
    console.log('option - prepareFiltroMovimentacoes: ', option);
    console.log('filtro - prepareFiltroMovimentacoes: ', filtro);
    return filtro[option];
};
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;