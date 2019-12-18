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
var utilDB = require('../utils/utilDB');

/******************************************************************************************
ROTA POST OU LIST(GET)
******************************************************************************************/
Router.route('/')

//LISTA
.get(function(req, res, next){
    
    var paginate = utilDB.paginate(req, res, next);

    poolQuery.getConnection(function(err, connection) {
        connection.query(`SELECT tb_registros.*, (SELECT count(*) FROM tb_registros WHERE excluido <> 1) AS COUNT_LINHA 
                          FROM tb_registros AS tb_registros WHERE excluido <> 1 `+ paginate,
        function (error, rows, fields) {
        connection.release();

            if (error){ res.status(400).send({ message: error.message }) }
            else{
                if (rows.length > 0) { res.status(200).send(utilDB.construirObjetoRetornoBD(rows)) }
                else { res.status(400).send({ message: `Não existem registros a serem exibidos!` }) }
            }

        });
    });

})
    
//CADASTRA
.post(function(req, res, next){

    var CAMPOS = {
        tb_baias_id: req.body.baias_id,
        tb_dosadores_id: req.body.dosadores_id,
        tb_animais_id: req.body.animais_id,
        tb_dietas_id: req.body.dietas_id,
        qa: req.body.qa,
        dia_animal: req.body.dia_animal,
        ativo: req.body.ativo,
        created: Moment().format('YYYY-MM-DD HH:mm:ss')
    };

    poolQuery.getConnection(function(err, connection) {

        connection.query(`INSERT INTO tb_registros SET ?`, CAMPOS,
        function (error, results, fields) {
        connection.release();

            if (error) { res.status(400).send({ message: error.message }) }
            else { res.status(200).send({ message: `O registro foi cadastrado com sucesso!` }) }

        });
    });

});

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id')
  
//SELECIONA
.get(function(req , res, next){

    poolQuery.getConnection(function(err, connection) {
        connection.query(`SELECT * FROM tb_registros WHERE excluido <> 1 AND id = ${req.params.id} LIMIT 1`,
        function (error, rows, fields) {
        connection.release();

            if (error){ res.status(400).send({ message: error.message }) }
            else{
                if (rows.length > 0) { res.status(200).send(rows) }
                else { res.status(400).send({ message: `O registro pesquisado não existe!` }) }
            }

        });
    });

})

//ATUALIZA
.put(function(req , res, next){

    var CAMPOS = {
        tb_baias_id: req.body.baias_id,
        tb_dosadores_id: req.body.dosadores_id,
        tb_animais_id: req.body.animais_id,
        tb_dietas_id: req.body.dietas_id,
        qa: req.body.qa,
        dia_animal: req.body.dia_animal,
        ativo: req.body.ativo
    };

    poolQuery.getConnection(function(err, connection) {

        connection.query(`UPDATE tb_registros SET ? WHERE id = ${req.params.id}`, CAMPOS,
        function (error, results, fields) {
        connection.release();

            if (error) { res.status(400).send({ message: error.message }) }
            else { res.status(200).send({ message: `Os dados do registro foram atualizados com sucesso!` }) }

        });
    });
    
})
    
//DELETA
.delete(function(req, res) {
    
    poolQuery.getConnection(function(err, connection) {

        connection.query(`UPDATE tb_registros SET excluido = 1 WHERE id = ${req.params.id}`,
        function (error, results, fields) {
        connection.release();

            if (error) { res.status(400).send({ message: error.message }) }
            else { res.status(200).send({ message: `O registro foi excluído com sucesso!` }) }

        });
    });

});

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;