/************
 **** UTILS CONTROLLER ****
 Author: Oficina5 - Soluções Inteligentes.

 OBSERVAÇÃO: FUNÇÕES ESTAO ATUALMENTE PREPARADA PARA UBUNTU DESKTOP(O.S.) - Contém funções responsaveis pelo gerenciamento de backup do sistema.
            
 *********/
const express = require('express');
const Router = express.Router();
const Moment = require('moment');
const db = require('../connect/db');
const mysql = require('mysql');
const poolQuery = mysql.createPool(db.config);
bcrypt = require('bcrypt-nodejs');

const fs = require('fs');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');

const base = require('../connect/db');

var list = [];
var nome;
var recebe = [];
var path_pendrive = '/media/nuc/sowtek5000';
var path_server_restore = './dump_days';
var aux;
var aux2;
var file;
var listDet = [];
var listArq = [];


/***************************
 * FUNÇÕES PARA LEITURA DE ARQUIVOS NO PENDRIVE
 */
async function listagemArquivosPendrive() {

    aux = await fs.readdirSync(path_pendrive);
    aux2 = await detalhesArquivosPendrive(path_pendrive, aux);
    return aux2;
}


async function detalhesArquivosPendrive(path_pendrive, aux) {
    listDet = [];
    listArq = [];
    list = [];
    for (var i = 0; i < aux.length; i++) {
        file = path_pendrive + '/' + aux[i];
        nome = aux[i];
        listDet = await fs.statSync(file)
        listArq = await adicionandoLista(nome, listDet)
    }
    return listArq;
}
/* FIM PENDRIVE
******************************* */



/***************************
 * FUNÇÕES PARA LEITURA DE ARQUIVOS NA PASTA DE BACKUP DO SERVER
 */
async function listagemArquivosLocalRestore() {

    aux = await fs.readdirSync(path_server_restore);
    aux2 = await detalhesArquivosLocalServer(path_server_restore, aux);
    return aux2;
}
async function detalhesArquivosLocalServer(path_server_restore, aux) {
    listDet = [];
    listArq = [];
    list = [];
    for (var i = 0; i < aux.length; i++) {
        file = path_server_restore + '/' + aux[i];
        nome = aux[i];
        listDet = await fs.statSync(file)
        listArq = await adicionandoLista(nome, listDet)
    }
    return listArq;
}
/* FIM SERVER
******************************* */

async function adicionandoLista(nome, listDet) {
    list.push({
        name: nome,
        size: (listDet['size'] / 1024000),
        created: listDet['birthtime']
    })
    return list;
}



/*****************************
 * ROTAS DE LISTAGEM/CRIAÇÃO DE ARQUIVOS EM PENDRIVE
 */
Router.route('/backup-local')

    .get(async function (req, res, next) {
        var exist_path = fs.existsSync('/media/nuc/sowtek5000');

        if (exist_path) {
            recebe = await listagemArquivosPendrive();
            if (recebe.length > 0) {
                res.status(200).send(recebe);
            }
            else {
                res.status(200).send([]);
            }
        }
        else {
            res.send({ message: 'O Local Storage deverá ser configurado!' });
        }
    });


Router.route('/backup-local/novo')
    .post(function (req, res, next) {
        var exist_path = fs.existsSync(path_pendrive)

        if (exist_path) {
            poolQuery.getConnection(function (err, connection) {
                var user = req.body.user;
                connection.query(`SELECT nome, senha FROM tb_usuarios WHERE email = ? AND ativo = 1 AND excluido = 0 `, [user],
                    function (error1, rows1, fields1) {
                        if (error1) {
                            res.status(500).send({ message: `Houve um erro ao conferir o usuário. Contate o suporte: ${error1.message}`, cod: 500 });
                            connection.release();
                        }
                        else {
                            if (bcrypt.compareSync(req.body.pass, rows1[0].senha)) {
                                connection.query(`SELECT version FROM tb_system_version ORDER BY id DESC LIMIT 1`,
                                    function (error, rows, fields) {
                                        connection.release();
                                        if (error) {
                                            res.status(500).send({ message: `Ocorreu um erro ao obter a versão atual do sistema: ${error.message}. Contate o suporte!`, cod: 500 })
                                        }
                                        else {
                                            var today = Moment().format('DDMMYYYY-HH:mm');
                                            var versao = rows[0].version;
                                            var name = today + '_' + versao;

                                            exec(`mysqldump -u fairtek  ${base.config.database} > ${name}.sql`, { cwd: path_pendrive },
                                                function (error, stdout, stderr) {
                                                    if (error) {
                                                        console.error(`exec error: ${error}`);
                                                        res.status(500).send({ message: "Houve um erro ao realizar o backup. Contate o suporte!", cod: 500 })
                                                        return;
                                                    }
                                                    else {
                                                        //VERIFICAR SUDO APENAS PARA ESTE COMANDO
                                                        exec(`sudo chattr +i '${name}.sql'`, { cwd: path_pendrive },
                                                            function (error2, stdout, stderr) {
                                                                if (error2) {
                                                                    console.error(`exec error2: ${error2}`);
                                                                    res.status(500).send({ message: "Houve um erro ao proteger o backup. Contate o suporte!", cod: 500 })
                                                                    return;
                                                                }
                                                                res.status(200).send({ message: "Backup realizado com sucesso.", cod: 200 });
                                                                console.log(`Proteção de arquivo executada.`);
                                                            })
                                                    }
                                                }
                                            )
                                        }
                                    });
                            }
                            else {
                                connection.release();
                                res.status(200).send({ message: 'A senha digitada esta incorreta. Favor verificar.', cod: 500 });
                            }
                        }

                    });
            })
        }
    });

/* FIM DE ROTAS BACKUP PENDRIVE
****************************************************** */



/**********************************************************
 * ROTAS DE IMPORTAÇÃO DE BACKUP PARA O SISTEMA
 * ***************************************************** */
Router.route('/restore/backup')

    /*********
     * get backups
     */
    .get(async function (req, res, next) {
        var exist_path = fs.existsSync('./dump_days/');

        if (exist_path) {
            recebe = await listagemArquivosLocalRestore();
            if (recebe.length > 0) {
                res.status(200).send(recebe);
            }
            else {
                res.status(200).send([]);
            }
        }
        else {
            res.send({ message: 'O Diretório de armazenamento está desconfigurado!' });
        }
    })


    /***********
     * RESTORE BACKUP
     */
    .post(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            var user = req.body.user;
            connection.query(`SELECT nome, senha FROM tb_usuarios WHERE email = ? AND ativo = 1 AND excluido = 0 `, [user],
                function (error1, rows1, fields1) {
                    if (error1) {
                        res.status(500).send({ message: `Houve um erro ao conferir o usuário. Contate o suporte: ${error1.message}`, cod: 500 });
                        connection.release();
                    }
                    else {
                        if (bcrypt.compareSync(req.body.pass, rows1[0].senha)) {

                            connection.query('SELECT version FROM tb_system_version ORDER BY id DESC LIMIT 1',
                                function (error, rows, fields) {
                                    if (error) {
                                        console.log('erro: ', error.message)
                                        res.status(500).send({ message: `Ocorreu um erro ao obter a versão atual do sistema: ${error.message}. Contate o suporte!`, cod: 500 })
                                        connection.release();
                                    }
                                    else {

                                        arquivo = req.body.nome_arq;
                                        versao_arq = arquivo.split('_');
                                        versao_arq = versao_arq[1];
                                        if (versao_arq == undefined || versao_arq.length == 0) {
                                            connection.release();
                                            res.status(200).send({ message: `Nomenclatura de arquivo incompatível. Contate o suporte caso tenha dúvidas!`, cod: 500 });
                                        }
                                        else {
                                            versao_arq = versao_arq.replace(".sql", "")
                                            versao_db = rows[0].version

                                            if (versao_db == versao_arq) {
                                                exec(`mysql -u fairtek ${base.config.database} < ${arquivo}`, { cwd: './dump_days/' },
                                                    function (error, stdout, stderr) {
                                                        if (error) {
                                                            console.error(`exec error: ${error}`);
                                                            res.status(500).send({ message: "Houve um erro ao restaurar o backup. Contate o suporte!", cod: 500 })
                                                            return;
                                                        }
                                                        connection.release();
                                                        res.status(200).send({ message: "Backup restaurado com sucesso.", cod: 200 });
                                                    })

                                            }
                                            else {
                                                connection.release();
                                                res.status(200).send({ message: "Versão de backup não suportada pelo sistema. Caso tenha dúvidas contate o Suporte.", cod: 500 });
                                            }
                                        }

                                    }
                                });
                        }
                        else {
                            connection.release();
                            res.status(200).send({ message: 'A senha digitada esta incorreta. Favor verificar.', cod: 500 });
                        }

                    }
                });

        });
    });


/***********
 *  GET VERSAO DO SISTEMA
*/
Router.route('/version/system')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT version FROM tb_system_version ORDER BY id DESC LIMIT 1`,
                function (error, rows, fields) {
                    connection.release();
                    if (error) {
                        res.status(500).send({ message: `Ocorreu um erro ao obter a versão atual do sistema + ${error.message}. Contate o suporte!` })
                    }
                    else {
                        res.status(200).send(rows[0]);

                    }
                })
        });
    })

/***********
 * FUNCOES DE CONFIGURAÇÃO PARA UBUNTU SERVER (O.S.)
 * ********* */



/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/




module.exports = Router;


