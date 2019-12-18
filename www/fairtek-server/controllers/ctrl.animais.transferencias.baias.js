/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require("express"),
  Router = express.Router(),
  db = require("../connect/db"),
  mysql = require("mysql"),
  poolQuery = mysql.createPool(db.config),
  utilDB = require("../utils/utilDB");

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route("/")

  //LISTA
  .get(function(req, res, next) {
    poolQuery.getConnection(function(err, connection) {
      connection.query(
        `SELECT 
             transferencia.usuario, transferencia.usuario_email,
             animais.brinco, animais.tatuagem, chips.chip, (SELECT nome FROM tb_baias WHERE id = transferencia.antiga_baia) AS antiga_baia, 
             (SELECT nome FROM tb_baias WHERE id = transferencia.nova_baia) AS nova_baia, DATE_FORMAT(transferencia.created, '%d/%m/%Y') AS data_transferencia
         FROM
             tb_animais_transferencias_baias AS transferencia
             INNER JOIN tb_animais AS animais
             ON transferencia.tb_animal_id = animais.id
             INNER JOIN tb_chips AS chips
             ON transferencia.chip = chips.id
         ORDER BY transferencia.id DESC`,
        function(error, rows, fields) {
          if (error) {
            res.status(404).send({message: error.message});
          } else {
            res.status(200).send(rows);
          }
          connection.release();
        }
      );
    });
  })

  //CADASTRA
  .post(function(req, res, next) {
    var CAMPOS = {
        animal_id: req.body.animal_id,
        nova_baia_id: req.body.nova_baia,
        usuario: req.body.usuario_nome,
        usuario_email: req.body.usuario_email
    };
    poolQuery.getConnection(function(err, connection) {
      connection.query(`INSERT INTO tb_animais_transferencias_baias
      (tb_animal_id, brinco, chip, antiga_baia, nova_baia, usuario, usuario_email, created)
      VALUES
      (?, (SELECT brinco FROM tb_animais WHERE id = ?), (SELECT chip FROM tb_animais WHERE id = ?),
      (SELECT baias_id FROM tb_animais WHERE id = ?), ?, ?, ?, NOW())`, 
      [CAMPOS.animal_id, CAMPOS.animal_id, CAMPOS.animal_id, CAMPOS.animal_id, CAMPOS.nova_baia_id, CAMPOS.usuario, CAMPOS.usuario_email ],
      function(error, rows) {
        if (error) {
            console.log("error 01: ", error);
          res.status(404).send({message: error.message});
          connection.release();
        } else {
            //BUSCA OS DADOS ANTIGOS DO ANIMAL
            connection.query(`SELECT id_rede, baias_id FROM tb_animais WHERE id = ?`, CAMPOS.animal_id,
            function(error, results){
                if(error){
                    console.log("error 02: ", error);
                    res.status(404).send({message: error.message});
                    connection.release();
                }else{
                    ANIMAL_ANTIGO = {
                        id_rede: results[0].id_rede,
                        baias_id: results[0].baias_id
                    }
                    console.log("Passou aqui:", ANIMAL_ANTIGO);
                    
                    //DESATIVA A REDE DO ANIMAL, REFERENTE A SUA ANTIGA BAIA
                    connection.query(`UPDATE tb_rede SET status = 0 WHERE id_rede = ? AND id_baia = ?`, [ANIMAL_ANTIGO.id_rede ,ANIMAL_ANTIGO.baias_id], 
                        function(error) {
                          if (error) {
                            console.log("error 02: ", error);
                            res.status(404).send({message: error.message});
                            connection.release();
                          } else {
                              //BUSCA NOVA REDE DO ANIMAL
                            connection.query(`SELECT id, id_rede FROM tb_rede WHERE status = 0 AND id_baia = ? ORDER BY id_rede ASC LIMIT 1`, CAMPOS.nova_baia_id, 
                              function(error, results1, fields) {
                                if (error) {
                                  console.log("error 03: ", error);
                                  res.status(404).send({message: error.message});
                                  connection.release();
                                } else {
                                  //UPDATE NA REDE, PARA ATIVAR O ID DA NOVA BAIA DO ANIMAL
                                  rede_id = results1[0].id;
                                  id_rede = results1[0].id_rede;
                                  console.log("id_rede: ", results1)
                                  connection.query(`UPDATE tb_rede SET status = 1 WHERE id = ?`, rede_id, 
                                    function(error, rows, fields) {
                                      if (error) {
                                        console.log("error 04: ", error);
                                        res.status(404).send({message: error.message});
                                        connection.release();
                                      } else {
                                        connection.query(`UPDATE tb_animais SET baias_id = ?, id_rede = ? WHERE id = ?`, [CAMPOS.nova_baia_id , id_rede, CAMPOS.animal_id], 
                                            function(error, rows, fields) {
                                              if (error) {
                                                console.log("error 05: ", error);
                                                res.status(404).send({message: error.message});
                                              } else {
                                                var CAMPOS_NOTIFICACAO = {
                                                    tb_notificacoes_tipos_id: 10,
                                                    valor: `{"origem: ${ANIMAL_ANTIGO.baias_id}": destino: ${CAMPOS.nova_baia_id}}`,
                                                    created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                };
                                                connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
                                                    function (error, results4, fields) {
                                                        console.log("error insert notificações: ", error)
                                                        if (error) {
                                                            res.status(400).send({ message: error.message });
                                                        }
                                                        else {
                                                            res.status(200).send({message: `Transferência realizada com sucesso!`});
                                                        }
                                                    }
                                                ); 

                                                
                                              }  
                                            }
                                        );
                                      }              
                                    });
                                }
                              }
                            );
                          }
                        })
                    }
                connection.release();
            })      
        }
    });
  });
});

/******************************************************************************************
ROTA ITEM (ID) - CADASTRA GRUPO
******************************************************************************************/
Router.route('/extra/combo/cadastra/grupo')


    //CADASTRA
    .post(function (req, res, next) {
        var VALUES = '';
        var animais = [];
        var baia = req.body[0].nova_baia;
        for (var i = 0; i < req.body.length; i++) {
            animais.push(req.body[i].animal_id);
            VALUES += `(${req.body[i].animal_id}, '${req.body[i].animal_brinco}', ${req.body[i].animal_chip}, ${req.body[i].animal_baia}, ${req.body[i].nova_baia}, '${req.body[i].usuario_nome}', '${req.body[i].usuario_email}', NOW()),`;
        }
        VALUES = VALUES.substring(0, VALUES.length - 1)
        var query = `INSERT INTO tb_animais_transferencias_baias (tb_animal_id, brinco, chip, antiga_baia, nova_baia, usuario, usuario_email, created) VALUES ${VALUES}`;
        console.log("query: ", query)
        poolQuery.getConnection(function (err, connection) {
            connection.query(query,
                function (error, results, fields) {                    
                    if (error) {
                        connection.release();
                        res.status(400).send({ message: error.message });
                    }
                    else {
                        //UPDATE DOS DADOS DOS ANIMAIS
                        CAMPOS_ANIMAIS = { baias_id: baia }                        
                        connection.query(`UPDATE tb_animais SET ? WHERE id IN (${animais})`, CAMPOS_ANIMAIS,
                            function (error, results, fields) {
                                if (error) { 
                                    res.status(400).send({ message: error.message });
                                }else {
                                    res.status(200).send({message: `Transferência realizada com sucesso!`});
                                }
                                connection.release();
                            }
                        );
                    }

                });
        });

    })


/******************************************************************************************
ROTA - CARREGA COMBO ANIMAIS TRANSFERENCIA
******************************************************************************************/
Router.route('/transferencia/animal')

    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                  animais.id AS animal_id,
                                  animais.brinco AS animal_brinco,
                                  animais.tatuagem AS animal_tatuagem,
                                  animais.chip AS animal_chip,
                                  animais.baias_id AS animal_baia,
                                  chips.chip AS chip_num,
                                  baias.nome AS baia_nome
                              FROM
                                  tb_animais AS animais
                                      INNER JOIN
                                  tb_chips AS chips ON animais.chip = chips.id
                                      INNER JOIN
                                  tb_baias AS baias ON animais.baias_id = baias.id
                              WHERE
                                  animais.excluido <> 1
                                  AND animais.calibracao <> 1
                                  AND animais.tb_setor_tipo_id = 2
                              ORDER BY animais.id ASC`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(404).send({message: error.message})
                    } else {
                        res.status(200).send(rows)
                    }
                    connection.release();
                });
        });

    })

/******************************************************************************************
ROTA - CARREGA COMBO BAIAS GERAL
******************************************************************************************/
Router.route('/baias/geral')

    //SELECIONA
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                  id AS baia_id, nome AS baia_nome
                              FROM
                                  tb_baias
                              WHERE
                                  excluido <> 1`,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(404).send({message: error.message})
                    } else {
                        res.status(200).send(rows)
                    }
                    connection.release();
                });
        });

    })

/******************************************************************************************
ROTA - CARREGA COMBO BAIAS TRANSFERÊNCIA
******************************************************************************************/
Router.route('/baias/transferencia/:id')

    //SELECIONA
    .get(function (req, res, next) {
        let baiaExcecao = req.params.id;
        console.log("baia: ", baiaExcecao)
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                  id AS baia_id, nome AS baia_nome
                              FROM
                                  tb_baias
                              WHERE
                                  excluido <> 1 AND id <> ?`, baiaExcecao,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(404).send({message: error.message})
                    } else {
                        res.status(200).send(rows)
                    }
                    connection.release();
                });
        });

    })

/******************************************************************************************
ROTA - CARREGA COMBO ANIMAIS NA BAIA
******************************************************************************************/
Router.route('/animais/baia/:id')

    //SELECIONA
    .get(function (req, res, next) {
        let baiaAnimais = req.params.id;
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT 
                                  animais.id AS animal_id,
                                  animais.brinco AS animal_brinco,
                                  animais.tatuagem AS animal_tatuagem,
                                  animais.chip AS animal_chip,
                                  animais.baias_id AS animal_baia,
                                  chips.chip AS chip_num,
                                  baias.nome AS baia_nome
                              FROM
                                  tb_animais AS animais
                                      INNER JOIN
                                  tb_chips AS chips ON animais.chip = chips.id
                                      INNER JOIN
                                  tb_baias AS baias ON animais.baias_id = baias.id
                              WHERE
                                  animais.excluido <> 1
                                AND animais.calibracao <> 1
                                  AND animais.tb_setor_tipo_id = 2
                                  AND animais.baias_id = ?
                              ORDER BY animais.id ASC`, baiaAnimais,
                function (error, rows, fields) {                    
                    if (error) {
                        res.status(404).send({message: error.message})
                    } else {
                        res.status(200).send(rows)
                    }
                    connection.release();
                });
        });

    })
/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
