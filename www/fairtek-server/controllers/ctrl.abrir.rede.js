/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express');
var Moment = require('../utils/moment');
var Router = express.Router();

/******************************************************************************************
MONGODB
******************************************************************************************/
var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

//LISTA
.get(function(req, res, next){

    var CAMPOS_NOTIFICACAO = {
        tb_notificacoes_tipos_id: 1,
        valor: `{}`,
        created: Moment().format('YYYY-MM-DD HH:mm:ss')
    };
    /* //GERANDO NOTIFICAÇÃO DE CONFIGURAR DOSADOR
    connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
        function (error, results, fields) {
        connection.release();

        if (error) { res.status(400).send({ message: error.message }) }
        else {
            res.status(200).send({ message: `Sua solicitação foi enviada com sucesso!` })

        }

    }) */

    poolQuery.getConnection(function(err, connection) {
        connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
        function (error, rows, fields) {
        connection.release();

            if (error){ res.status(500).send({ message: error.message });}
            else{
                res.status(200).send({ message: `Sua solicitação foi enviada com sucesso!` })
            }

        });
    });

})

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
