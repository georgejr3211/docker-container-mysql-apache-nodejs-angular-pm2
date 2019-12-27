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
Router.route('/historico/list/:id_dieta')

//LISTA
.get(function(req, res, next){
    
    poolQuery.getConnection(function(err, connection) {
        connection.query(`SELECT tb_dietas_historico.*,tb_dietas.nome FROM tb_dietas_historico AS  tb_dietas_historico 
        right join tb_dietas as tb_dietas on tb_dietas_historico.tb_dietas_id = tb_dietas.id WHERE tb_dietas_id = ${req.params.id_dieta} ORDER BY id DESC`,
        function (error, rows, fields) {
        connection.release();

            if (error){ res.status(400).send({ message: error.message }) }
            else{
                if (rows.length > 0) { res.status(200).send(rows) }
                else { res.status(400).send({ message: `Não existem edições a serem exibidas!` }) }
            }

        });
    });

});

Router.route('/')
    
// //CADASTRA
// .post(function(req, res, next){

//     var CAMPOS = {
//         tb_dietas_id: req.body.dietas_id,
//         dia: req.body.dia,
//         qr: req.body.qr,
//         qtd: req.body.qtd,
//         updated: Moment().format('YYYY-MM-DD HH:mm:ss'),
//         created: Moment().format('YYYY-MM-DD HH:mm:ss')
//     };

//     poolQuery.getConnection(function(err, connection) {

//         connection.query(`INSERT INTO tb_dieta_dias SET ?`, CAMPOS,
//         function (error, results, fields) {

//             if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//             else {

//                 //ATUALIZANDO TB_DIETAS
//                 var CAMPOS_DIETAS = {
//                     ag_update: 1
//                 };
//                 connection.query(`UPDATE tb_dietas SET ?, qtd_dias = qtd_dias + 1 WHERE id = ${req.body.dietas_id} `, CAMPOS_DIETAS,
//                 function (error, results, fields) {

//                     if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//                     else {

//                         //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
//                         var CAMPOS_NOTIFICACAO = {
//                             tb_notificacoes_tipos_id: 8,
//                             valor: `{}`,
//                             created: Moment().format('YYYY-MM-DD HH:mm:ss')
//                         };
//                         connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
//                             function (error, results, fields) {
//                                 connection.release();

//                                 if (error) { res.status(400).send({ message: error.message }) }
//                                 else {
//                                     res.status(200).send({ message: `O dia da dieta foi cadastrado com sucesso!` })

//                                 }

//                             })

//                     }

//                 })
//             }

//         });
//     });

// });

/******************************************************************************************
ROTA ITEM (ID)
******************************************************************************************/
Router.route('/:id')
  
//SELECIONA
.get(function(req , res, next){
    poolQuery.getConnection(function(err, connection) {
        connection.query(`SELECT * FROM tb_dietas_historico WHERE tb_dietas_id = ${req.params.id} `,
        function (error, rows, fields) {
        connection.release();

            if (error){ res.status(400).send({ message: error.message }) }
            else{
                if (rows.length > 0) { res.status(200).send(rows) }
                else { res.status(400).send({ message: `O historico pesquisado pesquisado não existe!` }) }
            }

        });
    });

})

// //ATUALIZA
// .put(function(req , res, next){

//     var CAMPOS = {
//         tb_dietas_id: req.body.dietas_id,
//         dia: req.body.dia,
//         qr: req.body.qr,
//         qtd: req.body.qtd,
//         updated: Moment().format('YYYY-MM-DD HH:mm:ss')
//     };

//     poolQuery.getConnection(function(err, connection) {

//         connection.query(`UPDATE tb_dieta_dias SET ? WHERE id = ${req.params.id}`, CAMPOS,
//         function (error, results, fields) {

//             if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//             else {

//                 //ATUALIZANDO TB_DIETAS
//                 var CAMPOS_DIETAS = {
//                     ag_update: 1
//                 };
//                 connection.query(`UPDATE tb_dietas SET ? WHERE id = ${req.body.dietas_id} `, CAMPOS_DIETAS,
//                 function (error, results, fields) {

//                     if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//                     else {

//                         //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
//                         var CAMPOS_NOTIFICACAO = {
//                             tb_notificacoes_tipos_id: 8,
//                             valor: `{}`,
//                             created: Moment().format('YYYY-MM-DD HH:mm:ss')
//                         };
//                         connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
//                             function (error, results, fields) {
//                                 connection.release();

//                                 if (error) { res.status(400).send({ message: error.message }) }
//                                 else {
//                                     res.status(200).send({ message: `O dia da dieta foi atualizado com sucesso!` })

//                                 }

//                             })

//                     }

//                 })
//             }

//         });
//     });
    
// })
    
// //DELETA
// .delete(function(req, res) {

//     var CAMPOS = {
//         excluido: 1
//     };
    
//     poolQuery.getConnection(function(err, connection) {

//         connection.query(`UPDATE tb_dieta_dias SET ? WHERE id = ${req.params.id}`, CAMPOS,
//         function (error, results, fields) {

//             if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//             else {

//                 //ATUALIZANDO TB_DIETAS
//                 var CAMPOS_DIETAS = {
//                     ag_update: 1
//                 };
//                 connection.query(`UPDATE tb_dietas SET ?, qtd_dias = qtd_dias - 1 WHERE id = ${req.params.id_dieta} `, CAMPOS_DIETAS,
//                 function (error, results, fields) {

//                     if (error) { res.status(400).send({ message: error.message }); connection.release(); }
//                     else {

//                         //GERANDO NOTIFICAÇÃO DE ALTERACAO DE RECEITA/DIETA
//                         var CAMPOS_NOTIFICACAO = {
//                             tb_notificacoes_tipos_id: 8,
//                             valor: `{}`,
//                             created: Moment().format('YYYY-MM-DD HH:mm:ss')
//                         };
//                         connection.query(`INSERT INTO tb_notificacoes SET ?`, CAMPOS_NOTIFICACAO,
//                             function (error, results, fields) {
//                                 connection.release();

//                                 if (error) { res.status(400).send({ message: error.message }) }
//                                 else {
//                                     res.status(200).send({ message: `O dia da dieta foi excluído com sucesso!` })

//                                 }

//                             })

//                     }

//                 })
//             }

//         });
//     });

// });

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;