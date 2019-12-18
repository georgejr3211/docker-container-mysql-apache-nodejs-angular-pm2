/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Router = express.Router();
Moment = require('moment');


var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);


Router.route('/')

    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_acl_grupos  WHERE excluido = 0 `,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: error.message });
                    }
                    else {
                        res.status(200).send(rows);
                    }
                })

        })
    })

    /****
     * CREATE DE GRUPO DE USUARIOS
     * *** */
    .post(function (req, res, next) {
        var grupo = {
            nome: req.body.nome,
            descricao: req.body.desc,
            status: req.body.ativo,
            excluido: 0,
            created: Moment().format('YYYY-MM-DD HH:mm:ss'),
            updated: Moment().format('YYYY-MM-DD HH:mm:ss')
        }
        var permissoes = req.body.permissions;
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_acl_grupos WHERE nome = '${grupo.nome}' AND status = 1 AND excluido = 0`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(500).send({ message: "Erro ao inserir o Grupo de Usuário. Contate o Administrador!" + error.message });
                        connection.release();
                    }
                    else {
                        if (rows.length > 0) {
                            res.status(200).send({ message: "erro" });
                            connection.release();

                        }
                        else {
                            connection.query(`INSERT INTO tb_acl_grupos SET ? `, grupo,
                                function (error1, rows1, fields) {

                                    if (error1) {
                                        res.status(500).send({ message: "Erro ao inserir o Grupo de Usuário. Contate o Administrador!" + error.message });
                                        connection.release();
                                    }
                                    else {
                                        var grupoID = rows1.insertId;
                                        let erros = 0;
                                        var permissao = {
                                            tb_acl_grupos_id: grupoID,
                                            tb_acl_regras_id: null,
                                            status: 1,
                                            created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                        };
                                        for (var i = 0; i < permissoes.length; i++) {
                                            permissao.tb_acl_regras_id = permissoes[i].regra;
                                            connection.query(`INSERT INTO tb_acl_permissoes SET ?`, permissao,
                                                function (error2, rows2, fields2) {
                                                    if (error2) {
                                                        res.status(500).send({ message: "Erro ao inserir permissões. Contate o Administrador!" + error2.message });
                                                        erros++;
                                                    }
                                                });
                                        }
                                        if (erros == 0) res.status(200).send({ message: 'Grupo de Usuários cadastrado com sucesso.' });
                                        connection.release();
                                    }
                                })
                        }
                    }

                });


        })
    })
/****
 * GET DE PERMISSOES DE GRUPOS DE USUARIOS
 * *** */
Router.route('/busca/permissions/:id')

    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT tb_acl_regras_id FROM tb_acl_permissoes WHERE tb_acl_grupos_id = ${req.params.id} AND status = 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: error.message })
                    }
                    else {
                        res.status(200).send(rows);
                    }
                });
        })
    })


/****
 * PUT DE GRUPO DE USUARIOS
 * *** */

Router.route('/atualiza/permissoes/:id')
    .put(function (req, res, next) {
      
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM tb_acl_grupos WHERE nome = '${req.body.nome}' AND id != ${req.params.id} AND excluido = 0`,
                function (erro, row, field) {
                    if (erro) {
                        res.status(500).send({ message: "Erro ao editar o Grupo de Usuário. Contate o Administrador!" + erro.message });
                        connection.release();
                    }
                    else {
                        if (row.length >= 1) {
                            res.status(200).send({ message: "erro" });
                            connection.release();

                        }
                        else {
                            connection.query(`UPDATE tb_acl_grupos SET nome = '${req.body.nome}', descricao = '${req.body.desc}', status = '${req.body.ativo}', updated = NOW() WHERE id=${req.params.id}`,
                                function (error0, rows0, fields0) {
                                    if (error0) {
                                        res.status(500).send({ message: "Erro ao editar o Grupo de Usuário. Contate o Administrador!" + error0.message });
                                        connection.release();
                                    }
                                    else {
                                        connection.query(`DELETE FROM tb_acl_permissoes WHERE tb_acl_grupos_id = ${req.params.id} AND status = 1`,
                                            function (error, rows, fields) {

                                                if (error) {
                                                    res.status(500).send({ message: 'Falha ao atualizar permissões. Contate o Administrador!' + error.message });
                                                    connection.release();
                                                }
                                                else {
                                                    var grupoID = req.params.id;
                                                    var erros = 0;
                                                    var permissoes = req.body.permissoes;
                                                    var permissao = {
                                                        tb_acl_grupos_id: grupoID,
                                                        tb_acl_regras_id: null,
                                                        status: 1,
                                                        created: Moment().format('YYYY-MM-DD HH:mm:ss')
                                                    };
                                                    for (var i = 0; i < permissoes.length; i++) {
                                                        permissao.tb_acl_regras_id = permissoes[i].regra;
                                                        connection.query(`INSERT INTO tb_acl_permissoes SET ?`, permissao,
                                                            function (error2, rows2, fields2) {
                                                                if (error2) {
                                                                    res.status(500).send({ message: "Falha ao atualizar permissões. Contate o Administrador!" + error2.message });
                                                                    erros++;
                                                                }
                                                            });
                                                    }
                                                    if (erros == 0) res.status(200).send({ message: 'Grupo de usuários atualizado com sucesso.' });
                                                    connection.release();

                                                }
                                            });
                                    }
                                }


                            );

                        }
                    }


                });
        });
    });
/****
 * DELETE DE GRUPO DE USUARIOS
 * *** */
Router.route('/deleta-grupo/:id')
    .delete(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_usuarios SET ativo = 0, excluido = 1, updated = NOW() WHERE tb_acl_grupos_id = ${req.params.id}`,
                function (error, rows, fields) {
                    if (error) {
                        res.status(500).send({ message: 'Falha ao deletar usuários vinculados ao grupo. Contate o Administrador!' + error.message })
                        connection.release();
                    }
                    else {
                        connection.query(`UPDATE tb_acl_permissoes SET status = 0 WHERE tb_acl_grupos_id = ${req.params.id}`,
                            function (error2, row2m, fields2) {
                                if (error2) {
                                    res.status(500).send({ message: 'Falha ao deletar permissões vinculadas ao grupo. Contate o Administrador!' + error2.message })
                                    connection.release();
                                }
                                else {
                                    connection.query(`UPDATE tb_acl_grupos SET status = 0, excluido = 1, updated = NOW() WHERE id = ${req.params.id}`,
                                        function (error3, rows3, fields3) {
                                            connection.release();
                                            if (error3) {
                                                res.status(500).send({ message: 'Falha ao deletar  grupo. Contate o Administrador!' + error3.message })
                                            }
                                            else {
                                                res.status(200).send({ message: 'Grupo de Usuários deletado com sucesso.' })
                                            }
                                        });
                                }

                            });

                    }
                });
        });
    });

/******************************************************************************************
ROTA ITEM (ID) - CARREGA COMBO
******************************************************************************************/
Router.route('/extra/combo')

    //SELECIONA
    .get(function (req, res, next) {

        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, nome FROM tb_acl_grupos WHERE excluido <> 1 AND status = 1`,
                function (error, rows, fields) {
                    connection.release();

                    if (error) { res.status(500).send({ message: error.message }) }
                    else {
                        if (rows.length > 0) { res.status(200).send(rows) }
                        else { res.status(200).send([]) }
                    }

                });
        });

    })

/******************************************************************************************
ROTA BUSCA TODAS PERMISSOES DO USUÁRIO/
******************************************************************************************/
Router.route('/get-permissoes/user/:id')

    .get(function(req, res, next){
        poolQuery.getConnection(function(err, connection){
            connection.query(`SELECT tb_acl_grupos_id FROM tb_usuarios WHERE id = ${req.params.id} AND ativo = 1 AND excluido = 0 LIMIT 1`,
            function(error, rows, fields){
                if(error){
                    res.status(500).send({message: "Erro ao buscar permissões do usuário.Contate o Administrador!" + error.message});
                    connection.release();
                }
                else{
                    connection.query(`SELECT tb_acl_regras_id FROM tb_acl_permissoes WHERE tb_acl_grupos_id = ${rows[0].tb_acl_grupos_id} AND status = 1`,
                        function(error2, rows2, fields2){
                            if(error2){
                                connection.release();
                                
                            }
                            else{
                                res.status(200).send(rows2);
                                connection.release();
                            }

                        }
                    )

                }
            })
        })

        
    })

module.exports = Router;