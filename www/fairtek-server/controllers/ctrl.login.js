/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express'),
    Moment = require('../utils/moment'),
    bcrypt = require('bcrypt-nodejs'),
    Router = express.Router(),
    salt = bcrypt.genSaltSync(10),
    config = require('../config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),

    /******************************************************************************************
    MONGODB
    ******************************************************************************************/
    db = require('../connect/db'),
    mysql = require('mysql'),
    poolQuery = mysql.createPool(db.config);



/**
 * CRIA TOKEN
 */

var secretKey = ";]G2,%M3yxr`5kYs33LMyr*v3fnv:z[-GCm<tQ/~P/(GeeSx9.W~[NAQ2>Q?R9[k";
function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.secretKey /* { expiresIn: 60 * 60 * 5 } */);
}

/**
 * LOGIN
 */

Router.route('/')
    //LOGIN
    .post(function (req, res, next) {

        var senhaCrypt = bcrypt.hashSync(req.body.senha);
        var CAMPOS = {
            email: req.body.email,
            senha: req.body.senha
        };
        poolQuery.getConnection(function (err, connection) {
            //VERIFICANDO SE USUARIO EXISTE
            console.log("campos: ", CAMPOS)
            if (err) {
                res.status(500).send({ message: err });
                console.log(err);
            }
            connection.query(`SELECT id, nome, email, last_login, tb_granja_id, tb_acl_grupos_id, senha FROM tb_usuarios WHERE excluido <> 1 AND ativo = 1 AND email = ? ORDER BY id ASC LIMIT 1`, [CAMPOS.email],
                function (error, rows, fields) {
                    if (error) {
                        res.status(400).send({ message: error });
                        console.log(error);
                        connection.release();
                    }
                    else {

                        if (rows.length > 0) {
                            rows[0].token = createToken(rows[0]);

                            //CONFERE SENHA DO USUÁRIO

                            if (bcrypt.compareSync(req.body.senha, rows[0].senha)) {

                                delete rows[0].senha

                                connection.query(`UPDATE tb_usuarios SET last_login = NOW() WHERE id='${rows[0].id}'`,
                                    function (error1, rows1, fields1) {
                                        connection.release();
                                        if (error1) {
                                            res.status(500).send({ message: "Houve um erro ao realizar o login." + error1.message });
                                        }
                                        else {
                                            res.status(201).send(rows[0]);
                                        }
                                    })
                            }
                            else {

                                res.status(401).send({ message: "Senha incorreta." });
                                connection.release();
                            }

                        }
                        //EXECUTA CADASTRO
                        else {
                            res.status(401).send({ message: "Usuário incorreto ou não existe." });
                            connection.release();

                        }
                    }

                });
        });

    });

/*******
 * ROTA PARA ALTERAÇÃO DE SENHA (PRIMEIRO LOGIN)
 ******/
Router.route('/reset-senha/:user')

    .put(function (req, res, next) {
        var senha = bcrypt.hashSync(req.body.passwd);

        poolQuery.getConnection(function (err, connection) {
            connection.query(`UPDATE tb_usuarios SET senha='${senha}', last_login = NOW()  WHERE email = '${req.params.user}'`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: 'Houve um erro ao alterar a senha: ' + error.message });
                    }
                    else {
                        res.status(200).send({ message: 'Senha alterada com sucesso.' });
                    }
                });
        });

    });

/******************************************************************************************
ROTA BUSCA USUARIO PARA PEDIR RESET DE SENHA
******************************************************************************************/
Router.route('/reseta/senha')

    //SELECIONA
    .put(function (req, res, next) {

        var CAMPOS = {
            email: req.body.email
        }
        poolQuery.getConnection(function (err, connection) {
            //BUSCA O USUARIO
            connection.query(`SELECT id FROM tb_usuarios WHERE email = '${CAMPOS.email}' limit 1`, [CAMPOS],
                function (error, results, fields) {
                    if (error) {
                        res.status(400).send({ message: "erro busca email" });
                        connection.release();
                    } else {
                        //SE O USUARIO EXISTIR, FAZ UPDATE NO MESMO
                        if (results.length > 0) {
                            var esqueceu_senha = 1;
                            connection.query(`UPDATE tb_usuarios SET esqueceu_senha = ${esqueceu_senha} WHERE excluido <> 1 AND email = '${CAMPOS.email}' AND id = ${results[0].id}`,
                                function (error, rows, fields) {
                                    if (error) {
                                        res.status(400).send({ message: 'erro envio notificação' })
                                    } else {
                                        res.status(200).send({ message: 'A solicitação do reset da senha foi enviada!' })
                                    }

                                });
                        } else {
                            connection.release();
                            res.status(400).send({ message: 'erro envio notificação' })
                        }
                    }
                });
        })
    })


/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
