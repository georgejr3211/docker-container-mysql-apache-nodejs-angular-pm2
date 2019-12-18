/*******************************************************************************************************************
MODULOS EXPRESS / CRON
*******************************************************************************************************************/
var express = require("express"),
    Moment = require("../utils/moment"),
    Router = express.Router(),
    db = require("../connect/db"),
    mysql = require("mysql"),
    poolQuery = mysql.createPool(db.config),
    utilDB = require("../utils/utilDB");
path_server_restore = "./dump_days";
path_pendrive = "/media/nuc/sowtek5000/";
data = Moment();

const CronJob = require("cron").CronJob;
const spawn = require("child_process").spawn;
const ls = spawn('ls', ['-1h', '/usr']);
const { exec } = require("child_process");
const fs = require("fs");
const base = require("../connect/db");


/*****************************
 * VERIFICANDO E LIMPANDO OS CAMINHOS DO PENDRIVE
 */
var pendrive_clearing_path = new CronJob("0 0 20 * * *", async function () {
    var path_pendrive_exist = fs.existsSync("/media/nuc/sowtek50001/");
    var pendrive_paths;
    console.log("entrou");

    if (path_pendrive_exist) {
        function verifyPendrivePaths() {
            return new Promise((resolve, reject) => {
                exec(`ls -d /media/nuc/* | awk -F/ '{print $NF}'`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        var log_erro_versao = `Status: Não foi possivel limpar os caminhos do pendrive. | Data: ${data}\n`;
                        fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                            function (erro) {
                                if (erro) {
                                    console.log("Erro ao cadastrar log em arquivo.");
                                    throw erro;
                                }
                                console.log("Log gravado com êxito.");
                            }
                        );
                        reject();
                    } else {
                        pendrive_paths = stdout;
                        resolve();
                    }
                }
                );
            });
        }
        function treatingReturnPendrivePath() {
            return new Promise((resolve, reject) => {
                pendrive_paths = pendrive_paths.split('\n')
                resolve(console.log(pendrive_paths))
            })
        }

        function removingPendrivePath() {
            return new Promise((resolve, reject) => {
                const loops = pendrive_paths.length - 2;
                for (let i = 0; i < loops; i++) {
                    removeDirectory = pendrive_paths[i];
                    console.log("remove: ", removeDirectory)
                    exec(`sudo rm -r /media/nuc/${removeDirectory}`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            console.log("error no stderr: ", error, stderr);
                            var log_erro_versao = `Status: Não foi possivel limpar os caminhos do pendrive ${removeDirectory}. | Data: ${data}\n`;
                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                function (erro) {
                                    if (erro) {
                                        console.log("Erro ao cadastrar log em arquivo.");
                                        throw erro;
                                    }
                                    console.log("Log gravado com êxito.");
                                }
                            );
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                }
            })
        }

        function rebootSystem() {
            return new Promise((resolve, reject) => {
                exec(`reboot`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        var log_erro_versao = `Status: Não foi possivel reiniciar o sistema. | Data: ${data}\n`;
                        fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                            function (erro) {
                                if (erro) {
                                    console.log("Erro ao cadastrar log em arquivo.");
                                    throw erro;
                                }
                                console.log("Log gravado com êxito.");
                            }
                        );
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }

        try {
            await verifyPendrivePaths();
            await treatingReturnPendrivePath();
            await removingPendrivePath();
            await rebootSystem();
        } catch (error) {
            throw error
        }
    } else {
        var log_erro_versao = `Status: O caminho do pendrive está limpo. | Data: ${data}\n`;
        fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
            function (erro) {
                if (erro) {
                    console.log("Erro ao cadastrar log em arquivo.");
                    throw erro;
                }
                console.log("Log gravado com êxito.");
            }
        );
    }
}, null, true, "America/Sao_Paulo");


/*****************************
 * ROTAS DE CRIAÇÃO DE ARQUIVOS DE BACKUP NO SERVER E CLOUD
 */

var backup = new CronJob("0 59 23* * *", function () {
    var exist_path = fs.existsSync(path_server_restore);
    var path_dump = "/home/nuc/FAIRTEK/fairtek-server/dump_days/";
    var path_mega = "/home/nuc/FAIRTEK/fairtek-server/dump_mega/";
    var path_pendrive_exist = fs.existsSync(path_pendrive);
    var zip_name = "";
    var old_name = "";
    var new_name = "";
    var name = "";
    var today = "";
    var versao = "";
    var versao_ponto = "";
    var data = Moment();
    var array_useless_files = [];

    if (path_pendrive_exist) {
        console.log("path: ", path_pendrive_exist)
        for (let i = 0; i < 10; i++) {
            if (!path_pendrive_exist) {
                path_pendrive = `/media/nuc/sowtek5000${i}/`
                console.log("first if: ", path_pendrive);
            }
            if (i == 9) {
                var data = Moment();
                var log_erro_registro_dados = `Status: Erro! O pendrive não foi encontrado. | Data: ${data}\n`;
                fs.writeFile("./logs_backup.txt", `${log_erro_registro_dados}`, { enconding: "utf-8", flag: "a" },
                    function (erro) {
                        if (erro) {
                            console.log("Erro ao cadastrar log em arquivo.");
                            throw erro;
                        }
                        console.log("Log gravado com êxito.");
                    }
                );
                return;
            }
        }
    }

    if (exist_path) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT version FROM tb_system_version ORDER BY id DESC LIMIT 1`,
                async function (error, rows, fields) {
                    if (error) {
                        //Caso haja erro para selecionar versao
                        console.log("Houve um erro ao obter versão do sistema.");
                        //Insere log de erro na tabela de logs para backup.
                        connection.query(
                            `INSERT INTO tb_backup_logs (status, detalhes, created) VALUES ('ERRO', 'HOUVE UM ERRO AO OBTER A VERSÃO DO SISTEMA.', NOW())`,
                            function (error1, rows1, fields1) {
                                if (error1) {
                                    //caso de erro na inserção do log de erro de backup;
                                    connection.release();
                                    console.log("Erro ao gravar log no sistema.");
                                } else {
                                    //caso de insercao de log de erro de backup irá inserir notificação para usuario
                                    connection.query(
                                        `INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, origem, destino, valor, lida, created, excluido, st_toast, visualizada) VALUES (21, null, null, '{}', 0, NOW(), 0, 0, 0)`,
                                        function (error2, rows2, fields2) {
                                            connection.release();
                                            if (error2) {
                                                console.log(
                                                    "Erro ao cadastrar notificação de erro de backup diario"
                                                );
                                            } else {
                                                console.log("Notificação gerada com sucesso.1");
                                            }
                                        }
                                    );
                                    //cadastra log de backup no .txt de logs
                                }
                            }
                        );
                        var log_erro_versao = `Status: Backup não realizado. Erro ao obter versão do sistema: ${error} . | Data: ${data}\n`;
                        fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                            function (erro) {
                                if (erro) {
                                    console.log("Erro ao cadastrar log em arquivo.");
                                    throw erro;
                                }
                                console.log("Log gravado com êxito.");
                            }
                        );
                    } else {
                        try {
                            console.log("try");
                            await new_dump();
                            await zip();
                            await change_variables_content();
                            await rename();
                            await cp_zip_mega();
                            await blocking_sql_file();
                            await delete_useless_files_dump(path_dump);
                            await delete_useless_files_mega(path_mega);
                            await mv_zip_pendrive();
                            await delete_useless_files_pendrive(path_pendrive);
                        } catch (error) {
                            console.log("error", error);
                            var log_erro_versao = `Status: Erro na rotina de backup ${error} . | Data: ${data}\n`;
                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                function (erro) {
                                    if (erro) {
                                        console.log("Erro ao cadastrar log em arquivo.");
                                        throw erro;
                                    }
                                    console.log("Log gravado com êxito.");
                                }
                            );
                        }

                        function new_dump() {
                            today = Moment().format("DDMMYYYYHHmm");
                            versao = rows[0].version;
                            versao_ponto = rows[0].version;
                            versao = versao.split(".").join("_");
                            name = today + "_" + versao;
                            return new Promise((resolve, reject) => {
                                {
                                    exec(`mysqldump -u fairtek ${base.config.database} > ${name}.sql`, { cwd: "./dump_days/" },
                                        function (error, stdout, stderr) {
                                            if (error) {
                                                console.error(`exec error: ${error}`);
                                                //Insere log de erro na tabela de logs para backup.
                                                connection.query(
                                                    `INSERT INTO tb_backup_logs (status, detalhes, created) VALUES ('ERRO', 'HOUVE UM ERRO AO REALIZAR O BACKUP DIÁRIO: ${error}.', NOW())`,
                                                    function (error1, rows1, fields1) {
                                                        if (error1) {
                                                            //caso de erro na inserção do log de erro de backup;
                                                            connection.release();
                                                            console.log("Erro ao gravar log no sistema.");
                                                        } else {
                                                            //caso de insercao de log de erro de backup irá inserir notificação para usuario
                                                            connection.query(
                                                                `INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, origem, destino, valor, lida, created, excluido, st_toast, visualizada) VALUES (21, null, null, '{}', 0, NOW(), 0, 0, 0)`,
                                                                function (error2, rows2, fields2) {
                                                                    connection.release();
                                                                    if (error2) {
                                                                        console.log(
                                                                            "Erro ao cadastrar notificação de erro de backup diario"
                                                                        );
                                                                    } else {
                                                                        console.log(
                                                                            "Notificação gerada com sucesso.2"
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                            //cadastra log de backup no .txt de logs
                                                        }
                                                    }
                                                );
                                                var log_erro_backup = `Status: Erro ao realizar Backup: ${error}. | Data: ${data}\n`;
                                                fs.writeFile("./logs_backup.txt", `${log_erro_backup}`, { enconding: "utf-8", flag: "a" },
                                                    function (erro) {
                                                        if (erro) {
                                                            console.log(
                                                                "Erro ao cadastrar log em arquivo."
                                                            );
                                                            throw erro;
                                                        }
                                                        console.log("Log gravado com êxito.");
                                                    }
                                                );
                                                return reject();
                                            } else {
                                                //Insere log de sucesso na tabela de logs para backup.
                                                connection.query(
                                                    `INSERT INTO tb_backup_logs (status, detalhes, created) VALUES ('SUCESSO', 'BACKUP DIÁRIO REALIZADO COM SUCESSO.', NOW())`,
                                                    function (error1, rows1, fields1) {
                                                        if (error1) {
                                                            //caso de erro na inserção do log de erro de backup;
                                                            connection.release();
                                                            console.log("Erro ao gravar log no sistema.");
                                                            return resolve();
                                                        } else {
                                                            //caso de insercao de log de sucesso de backup irá inserir notificação para usuario
                                                            connection.query(
                                                                `INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, origem, destino, valor, lida, created, excluido, st_toast, visualizada) VALUES (22, null, null, '{}', 0, NOW(), 0, 0, 0)`,
                                                                function (error2, rows2, fields2) {
                                                                    connection.release();
                                                                    if (error2) {
                                                                        console.log(
                                                                            "Erro ao cadastrar notificação de sucesso de backup diario", error2
                                                                        );
                                                                    } else {
                                                                        console.log(
                                                                            "Notificação gerada com sucesso.3"
                                                                        );
                                                                        return resolve();
                                                                    }
                                                                }
                                                            );
                                                            //cadastra log de backup no .txt de logs
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                }
                            });
                        }

                        function zip() {
                            console.log("entrou no zip");
                            return new Promise((resolve, reject) => {
                                exec(`zip ${path_dump}${name} ${path_dump}${name}.sql`,
                                    (error, stdout, stderr) => {
                                        if (error || stderr) {
                                            var log_erro_versao = `Status: Backup realizado apenas na dump. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            reject();
                                        } else {
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                        function change_variables_content() {
                            return new Promise((resolve, reject) => {
                                zip_name = name + ".zip";
                                old_name = name + ".sql";
                                name = today + "_" + versao_ponto;
                                new_name = name + ".sql";
                                console.log("entrou no change_variables_content: ", old_name, new_name);
                                resolve();
                            });
                        }

                        function rename() {
                            return new Promise((resolve, reject) => {
                                console.log("rename:");
                                exec(`sudo mv ${path_dump}${old_name} ${path_dump}${new_name}`,
                                    (error, stdout, stderr) => {
                                        console.log("error: ", error, stderr);
                                        if (error || stderr) {
                                            var log_erro_versao = `Status: Backup realizado, mas os arquivos não foram renomeados. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            reject();
                                        } else {
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                        function cp_zip_mega() {
                            console.log("entrou no cp_zip_mega");
                            return new Promise((resolve, reject) => {
                                exec(`sudo cp ${path_dump}${zip_name} ${path_mega}`,
                                    (error, stdout, stderr) => {
                                        if (error || stderr) {
                                            var log_erro_versao = `Status: Backup realizado, mas o zip não foi enviado ao diretório do MEGAsync. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            reject();
                                        } else {
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                        function mv_zip_pendrive() {
                            console.log("entrou no mv_zip_pendrive");
                            return new Promise((resolve, reject) => {
                                exec(`sudo mv ${path_dump}${zip_name} ${path_pendrive}`,
                                    (error, stdout, stderr) => {
                                        if (error || stderr) {
                                            var log_erro_versao = `Status: Backup realizado, mas o zip não foi enviado ao pendrive. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_erro_versao}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            reject();
                                        } else {
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                        function blocking_sql_file() {
                            return new Promise((resolve, reject) => {
                                exec(`sudo chattr +i ${name}.sql`, { cwd: "./dump_days" },
                                    function (error, stdout, stderr) {
                                        if (error) {
                                            console.error(`exec error: ${error}`);
                                            var log_erro_protect = `Status: Backup realizado, porem houve um erro ao protege-lo: ${erro}. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_erro_protect}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            return reject();
                                        } else {
                                            console.log(`Proteção de arquivo executada.`);
                                            var log_sucesso = `Status: Backup realizado e protegido com sucesso. | Data: ${data}\n`;
                                            fs.writeFile("./logs_backup.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                function (erro) {
                                                    if (erro) {
                                                        console.log("Erro ao cadastrar log em arquivo.");
                                                        throw erro;
                                                    }
                                                    console.log("Log gravado com êxito.");
                                                }
                                            );
                                            return resolve();
                                        }
                                    }
                                );
                            });
                        }

                        function delete_useless_files_dump(path) {
                            return new Promise((resolve, reject) => {
                                files = fs.readdirSync(path)
                                console.log("delete_useless_files_dump")
                                controller_delete_dump();
                                async function controller_delete_dump() {
                                    try {
                                        await get_files();
                                        await release_dump_files();
                                        await file_delete();
                                        resolve();
                                    } catch (error) {
                                        console.log("error DELETE: ", error);
                                        reject();
                                    }
                                }

                                function get_files() {
                                    return new Promise((resolve, reject) => {
                                        array_useless_files = [];
                                        console.log("files lenght: ", files.length)
                                        for (let i = 0; i < files.length; i++) {
                                            let file = files[i];
                                            fs.stat(`${path}/${file}`, function (err, stats) {
                                                if (err) {
                                                    reject();
                                                }
                                                let file_birth = Moment(stats.mtime);
                                                let until_day = Moment().subtract(5, "days");
                                                let difference = file_birth.diff(until_day, "days");
                                                if (difference < 0) {
                                                    array_useless_files.push(file);
                                                }
                                                console.log("files: ", array_useless_files)
                                                if (i == files.length - 1) {
                                                    //console.log("1: ", array_useless_files)
                                                    resolve();
                                                }
                                            });
                                        }
                                    });
                                }

                                function release_dump_files() {
                                    return new Promise((resolve, reject) => {
                                        console.log("release size: ", array_useless_files.length)
                                        for (let j = 0; j < array_useless_files.length; j++) {
                                            let release_file = array_useless_files[j];
                                            exec(`sudo chattr -i ${path}${release_file}`,
                                                (error) => {
                                                    if (error) {
                                                        console.error(`exec error: ${error}`);
                                                        var log_erro_release = `Status: Backup realizado, porem houve um erro ao liberar os arquivos antigos para a exclusão: ${error}. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_erro_release}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                //console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        reject();
                                                    } else {
                                                        //console.log(`Liberação de arquivo executada. Release`);
                                                        var log_sucesso = `Status: Backup realizado e arquivo antigo liberado. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                // console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        if (j == array_useless_files.length - 1) {
                                                            //console.log("2: ", array_useless_files);
                                                            resolve()
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    });
                                }

                                function file_delete() {
                                    return new Promise((resolve, reject) => {
                                        for (let k = 0; k < array_useless_files.length; k++) {
                                            let delete_file = array_useless_files[k];
                                            exec(`sudo rm -r ${path}${delete_file}`,
                                                (error, stdout, stderr) => {
                                                    if (error) {
                                                        console.error(`exec error: ${error}`);
                                                        var log_erro_release = `Status: Backup realizado, porem houve um erro ao remover os arquivos antigos para a exclusão: ${error}. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_erro_release}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        reject();
                                                    } else {
                                                        //console.log(`O arquivo ${delete_file} foi deletado.`);
                                                        var log_sucesso = `Status: Backup realizado e arquivo antigo removido. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                //console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        resolve();
                                                    }
                                                }
                                            );
                                        }
                                    })
                                }
                            })
                        }

                        function delete_useless_files_mega(path) {
                            return new Promise((resolve, reject) => {
                                files = fs.readdirSync(path)
                                console.log("delete_useless_files_mega")
                                controller_delete_mega();
                                async function controller_delete_mega() {
                                    try {
                                        await get_files();
                                        await file_delete();
                                        resolve();
                                    } catch (error) {
                                        console.log("error DELETE: ", error);
                                        reject();
                                    }
                                }

                                function get_files() {
                                    return new Promise((resolve, reject) => {
                                        array_useless_files = [];
                                        for (let i = 0; i < files.length; i++) {
                                            let file = files[i];
                                            fs.stat(`${path}/${file}`, function (err, stats) {
                                                if (err) {
                                                    reject();
                                                }
                                                let file_birth = Moment(stats.mtime);
                                                let until_day = Moment().subtract(5, "days");
                                                let difference = file_birth.diff(until_day, "days");
                                                if (difference < 0) {
                                                    array_useless_files.push(file);
                                                }
                                                if (i == files.length - 1) {
                                                    //console.log("1: ", array_useless_files)
                                                    resolve();
                                                }
                                            });
                                        }
                                    });
                                }

                                function file_delete() {
                                    return new Promise((resolve, reject) => {
                                        for (let k = 0; k < array_useless_files.length; k++) {
                                            let delete_file = array_useless_files[k];
                                            exec(`sudo rm -r ${path}${delete_file}`,
                                                (error, stdout, stderr) => {
                                                    if (error) {
                                                        console.error(`exec error: ${error}`);
                                                        var log_erro_release = `Status: Backup realizado, porem houve um erro ao remover os arquivos antigos para a exclusão: ${error}. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_erro_release}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        reject();
                                                    } else {
                                                        //console.log(`O arquivo ${delete_file} foi deletado.`);
                                                        var log_sucesso = `Status: Backup realizado e arquivo antigo removido. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                //console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        resolve();
                                                    }
                                                }
                                            );
                                        }
                                    })
                                }
                            })
                        }

                        function delete_useless_files_pendrive(path) {
                            return new Promise((resolve, reject) => {
                                files = fs.readdirSync(path)
                                console.log("delete_useless_files_pendrive")
                                controller_delete_pendrive();
                                async function controller_delete_pendrive() {
                                    try {
                                        await get_files();
                                        await file_delete();
                                        resolve();
                                    } catch (error) {
                                        console.log("error DELETE: ", error);
                                        reject();
                                    }
                                }

                                function get_files() {
                                    return new Promise((resolve, reject) => {
                                        array_useless_files = [];
                                        for (let i = 0; i < files.length; i++) {
                                            let file = files[i];
                                            fs.stat(`${path}/${file}`, function (err, stats) {
                                                if (err) {
                                                    reject();
                                                }
                                                let file_birth = Moment(stats.mtime);
                                                let until_day = Moment().subtract(5, "days");
                                                let difference = file_birth.diff(until_day, "days");
                                                if (difference < 0) {
                                                    array_useless_files.push(file);
                                                }
                                                if (i == files.length - 1) {
                                                    console.log("1: ", array_useless_files)
                                                    resolve();
                                                }
                                            });
                                        }
                                    });
                                }

                                function file_delete() {
                                    return new Promise((resolve, reject) => {
                                        console.log("file_delete 1")
                                        for (let k = 0; k < array_useless_files.length; k++) {
                                            let delete_file = array_useless_files[k];
                                            exec(`sudo rm -r ${path}${delete_file}`,
                                                (error, stdout, stderr) => {
                                                    if (error) {
                                                        console.error(`exec error: ${error}`);
                                                        var log_erro_release = `Status: Backup realizado, porem houve um erro ao remover os arquivos antigos para a exclusão: ${error}. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_erro_release}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        reject();
                                                    } else {
                                                        //console.log(`O arquivo ${delete_file} foi deletado.`);
                                                        var log_sucesso = `Status: Backup realizado e arquivo antigo removido. | Data: ${data}\n`;
                                                        fs.writeFile("./logs_backup.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                            function (erro) {
                                                                if (erro) {
                                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                                    throw erro;
                                                                }
                                                                //console.log("Log gravado com êxito.");
                                                            }
                                                        );
                                                        resolve();
                                                    }
                                                }
                                            );
                                        }
                                    })
                                }
                            })
                        }

                    }
                });
        });
    }
}, null, true, "America/Sao_Paulo");

/* FIM DE ROTAS  NO SERVER E CLOUD
 ****************************************************** */

/*****************************
 * ROTAS DE REGISTRO DOS DADOS DA GRANJA NO DIA
 */
var registro_dados = new CronJob("0 0 */1 * * *",
    function () {
        console.log("Entrou no registro");
        poolQuery.getConnection(function (err, connection) {
            let data_now = Moment().format('YYYY-MM-DD');
            let selectQuery = `SELECT created FROM tb_dados_historicos WHERE date(created) = '${data_now}'`;
            connection.query(`${selectQuery}`,
                function (error, rows, fields) {
                    if (error) {
                        connection.release();
                        console.log("Houve um erro ao buscar as informações de registro diarios no banco.");
                        var data = Moment();
                        var log_erro_registro_dados = `Status: Erro ao realizar a busca dos dados de registros diarios no banco: ${error}. | Data: ${data}\n`;
                        fs.writeFile("./logs_registro_dados.txt", `${log_erro_registro_dados}`, { enconding: "utf-8", flag: "a" },
                            function (erro) {
                                if (erro) {
                                    console.log("Erro ao cadastrar log em arquivo.");
                                    throw erro;
                                }
                                console.log("Log gravado com êxito.");
                            }
                        );
                        return;
                    } else {
                        console.log("rows: ", rows.length);
                        if (rows.length == 0) {
                            connection.query(`
              -- TOTAL DE ANIMAIS NA FAZENDA ONTEM
              SELECT 
                  -- TOTAL DE BAIAS  
                  DISTINCT(principal_baias.id) AS baia_id,
                  (principal_dosadores.id) AS dosador_id,

                  -- TOTAL DE ANIMAIS NA BAIA
                  (SELECT COUNT(id) FROM tb_animais WHERE baias_id = principal_baias.id 
                  AND	excluido = 0
                  AND calibracao = 0
                  AND tb_setor_tipo_id = 2
                  ) AS qtde_animais_baia,

                  -- TOTAL DE ANIMAIS APTOS A SE ALIMENTAR NA BAIA
                  (SELECT
                COUNT(animais.id)
              FROM
                tb_animais AS animais
              LEFT JOIN
                tb_baias ON animais.baias_id = tb_baias.id
              WHERE
                principal_animais.excluido = 0
                  AND principal_baias.id = animais.baias_id
                              AND calibracao = 0
                              AND (tb_setor_tipo_id = 2
                              AND (SELECT 
                                  tb_setor_tipo_id
                              FROM
                                  tb_animais_movimentacoes AS movimentacoes
                              WHERE
                                  movimentacoes.tb_animal_id = animais.id
                                  AND 
                                  ((SELECT MAX(created) FROM tb_animais_movimentacoes WHERE tb_animal_id = movimentacoes.tb_animal_id)
                                  < DATE_ADD(CURDATE(), INTERVAL - 1 DAY))
                                  LIMIT 1) = 2)) AS qtde_animais_aptos_alimentar_baia,

            --  TOTAL DE ANIMAIS ALIMENTADOS TOTALMENTE NA BAIA (CORRIGIDO)            
                  (SELECT
                COUNT(tb_baias_id)
              FROM tb_dosadores AS dosadores
                LEFT JOIN
                  tb_animais_registros AS registros ON dosadores.id = registros.ult_dosador
              WHERE registros.qa >= registros.qt
                AND registros.ult_dosador = dosadores.id
                          AND dosadores.tb_baias_id = principal_baias.id
                          AND DATE(registros.created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)) AS qtde_alimentados_total_baia, 

                  -- TOTAL DE ANIMAIS ALIMENTADOS PARCIALMENTE NA BAIA (CORRIGIDO)
                  (SELECT 
                COUNT(tb_baias_id) 
                      FROM tb_dosadores AS dosadores
                          LEFT JOIN 
                  tb_animais_registros AS registros ON dosadores.id = registros.ult_dosador
              WHERE registros.qa > 0 AND registros.qa < registros.qt
                AND registros.ult_dosador = dosadores.id
                          AND dosadores.tb_baias_id = principal_baias.id
                AND DATE(registros.created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)) AS qtde_alimentados_parcial_baia,

                  -- TOTAL DE ANIMAIS NÃO ALIMENTADOS NA BAIA
                  -- qtde_animais_baia - qtde_alimentados_total_baia + qtde_alimentados_parcial_baia 
                  (
                      ((SELECT
                COUNT(animais.id)
              FROM
                tb_animais AS animais
              LEFT JOIN
                tb_baias ON animais.baias_id = tb_baias.id
              WHERE
                principal_animais.excluido = 0
                  AND principal_baias.id = animais.baias_id
                              AND calibracao = 0
                              AND (tb_setor_tipo_id = 2
                              AND (SELECT 
                                  tb_setor_tipo_id
                              FROM
                                  tb_animais_movimentacoes AS movimentacoes
                              WHERE
                                  movimentacoes.tb_animal_id = animais.id
                                  AND 
                                  ((SELECT MAX(created) FROM tb_animais_movimentacoes WHERE tb_animal_id = movimentacoes.tb_animal_id)
                                  < DATE_ADD(CURDATE(), INTERVAL - 1 DAY))
                                  LIMIT 1) = 2))
                      )
                      -
                      (
                          (SELECT
                    COUNT(tb_baias_id)
                  FROM tb_dosadores AS dosadores
                    LEFT JOIN
                      tb_animais_registros AS registros ON dosadores.id = registros.ult_dosador
                  WHERE registros.qa >= registros.qt
                    AND registros.ult_dosador = dosadores.id
                    AND dosadores.tb_baias_id = principal_baias.id
                    AND DATE(registros.created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)
                          )
                          +
                          (SELECT 
                    COUNT(tb_baias_id) 
                  FROM tb_dosadores AS dosadores
                    LEFT JOIN 
                      tb_animais_registros AS registros ON dosadores.id = registros.ult_dosador
                  WHERE registros.qa > 0 AND registros.qa < registros.qt
                    AND registros.ult_dosador = dosadores.id
                    AND dosadores.tb_baias_id = principal_baias.id
                    AND DATE(registros.created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY)
                          )            
                      )

                  ) AS qtde_nao_alimentados_baia,

                  -- TOTAL DE DOSADORES NA BAIA
                  (SELECT COUNT(id) FROM tb_dosadores WHERE tb_baias_id = principal_baias.id) AS qtde_dosadores_baia,

                  (SELECT 
                          COUNT(tb_animais.id)
                      FROM
                          tb_animais
                      WHERE
                              tb_animais.excluido <> 1
                              AND tb_animais.calibracao <> 1) AS qtde_animais_geral,
              -- TOTAL ANIMAIS NA GESTACAO ONTEM GERAL
                  (SELECT
                          COUNT(id)
                      FROM
                          tb_animais
                      WHERE
                          tb_setor_tipo_id = 2
                              AND tb_animais.excluido <> 1
                              AND tb_animais.calibracao <> 1
                      ) AS qtde_animais_gestacao, 

              -- TOTAL DE ANIMAIS NA GESTACAO ONTEM APTOS A SE ALIMENTAREM
                  (SELECT 
                          COUNT(id)
                      FROM
                          tb_animais AS animais
                      WHERE
                         excluido = 0
                              AND calibracao = 0
                              AND (tb_setor_tipo_id = 2
                              AND (SELECT 
                                  tb_setor_tipo_id
                              FROM
                                  tb_animais_movimentacoes AS movimentacoes
                              WHERE
                                  movimentacoes.tb_animal_id = animais.id
                                  AND 
                                  ((SELECT MAX(created) FROM tb_animais_movimentacoes WHERE tb_animal_id = movimentacoes.tb_animal_id)
                                  < DATE_ADD(CURDATE(), INTERVAL - 1 DAY))
                                  LIMIT 1) = 2))  AS qtde_animais_aptos_alimentar_gestacao,

              -- TOTAL DE ANIMAIS ALIMENTADOS PARCIALMENTE ONTEM    
                  (SELECT 
                          COUNT(id)
                      FROM
                          tb_animais_registros
                      WHERE
                          qa > 0 AND qa < qt
                              AND DATE(created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY) LIMIT 1) AS qtde_animais_alimentados_parcial,

              -- TOTAL DE ANIMAIS ALIMENTADOS TOTALMENTE ONTEM    
                  (SELECT 
                          COUNT(id)
                      FROM
                          tb_animais_registros
                      WHERE
                          qa >= qt
                              AND DATE(created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY) LIMIT 1) AS qtde_animais_alimentados_total,

              -- TOTAL DE ANIMAIS NAO ALIMENTADOS ONTEM 
                  (   
                      (SELECT 
                          COUNT(id)
                      FROM
                          tb_animais AS animais
                      WHERE
                         excluido = 0
                              AND calibracao = 0
                              AND (tb_setor_tipo_id = 2
                              AND (SELECT 
                                  tb_setor_tipo_id
                              FROM
                                  tb_animais_movimentacoes AS movimentacoes
                              WHERE
                                  movimentacoes.tb_animal_id = animais.id
                                  AND 
                                  ((SELECT MAX(created) FROM tb_animais_movimentacoes WHERE tb_animal_id = movimentacoes.tb_animal_id)
                                  < DATE_ADD(CURDATE(), INTERVAL - 1 DAY))
                                  LIMIT 1) = 2)) - 
              -- TOTAL DE ANIMAIS ALIMENTADOS PARCIALMENTE E TOTALMENTE                    
                       (SELECT 
                              COUNT(id)
                          FROM
                              tb_animais_registros
                          WHERE
                              qa > 0
                                  AND DATE(created) = DATE_ADD(CURDATE(), INTERVAL - 1 DAY) LIMIT 1) 
                  ) AS qtde_nao_alimentados_geral,
                  (SELECT 
                          COUNT(*)
                      FROM
                          tb_baias AS baias
                      WHERE

                               baias.ativo = 1
                              AND baias.excluido = 0) AS qtde_baias,
              -- QTDE DOSADORES ATIVOS
                  (SELECT
                          COUNT(id)
                      FROM
                          tb_dosadores
                      WHERE
                          ativo = 1) AS qtde_dosadores_geral_ativos,
              -- QTDE DOSADORES INATIVOS
                  (SELECT
                          COUNT(id)
                      FROM
                          tb_dosadores
                      WHERE
                          ativo = 0) AS qtde_dosadores_geral_inativos,
          -- QTDE RACAO GERAL
            (SELECT
                SUM(registros.qa)
              FROM
                tb_animais_registros AS registros
              WHERE DATE(registros.created) < DATE_ADD(CURDATE(), INTERVAL 0 DAY)) AS qtde_racao_geral,
          -- QTDE RACAO POR DOSADOR
                  (SELECT
                SUM(registros.qa)
              FROM
                tb_animais_registros AS registros
              WHERE
                registros.ult_dosador = principal_dosadores.id
                  AND DATE(registros.created) < DATE_ADD(CURDATE(), INTERVAL 0 DAY)) AS qtde_racao_dosador,
          -- QTDE RACAO POR BAIA
                  (SELECT
                SUM(registros.qa)
              FROM
                tb_animais_registros AS registros
              WHERE
                principal_baias.id = principal_dosadores.tb_baias_id
                  AND registros.ult_dosador = principal_dosadores.id
                  AND principal_baias.id = principal_dosadores.tb_baias_id
                  AND DATE(registros.created) < DATE_ADD(CURDATE(), INTERVAL 0 DAY)) AS qtde_racao_baia
              FROM
                  tb_animais AS principal_animais
                  INNER JOIN tb_baias AS principal_baias ON principal_animais.baias_id = principal_baias.id
                  INNER JOIN tb_dosadores AS principal_dosadores ON principal_baias.id = principal_dosadores.tb_baias_id
                  LEFT JOIN tb_animais_registros AS principal_animais_registros ON principal_animais.id = principal_animais_registros.tb_animais_id
                  LEFT JOIN tb_animais_movimentacoes AS principal_animais_movimentacoes ON principal_animais.id = principal_animais_movimentacoes.tb_animal_id
              WHERE 
                  principal_animais.excluido = 0
                  AND principal_animais.calibracao = 0            
                  AND principal_baias.excluido = 0
                  AND principal_animais.tb_setor_tipo_id = 2
              `,
                                function (error, rows, fields) {
                                    if (error || rows.length === 0) {
                                        console.log("Houve um erro ao buscar as informações do sistema.");
                                        var data = Moment();
                                        var log_erro_registro_dados = `Status: Erro ao realizar a busca dos dados no banco: ${error}. | Data: ${data}\n`;
                                        fs.writeFile("./logs_registro_dados.txt", `${log_erro_registro_dados}`, { enconding: "utf-8", flag: "a" },
                                            function (erro) {
                                                if (erro) {
                                                    console.log("Erro ao cadastrar log em arquivo.");
                                                    throw erro;
                                                }
                                                console.log("Log gravado com êxito.");
                                            }
                                        );
                                        return;
                                    } else {
                                        console.log("rows: ", rows);
                                        var created = Moment().format("YYYY-MM-DD HH:mm:ss");
                                        //MONTANDO QUERY PARA INSERÇÃO DOS REGISTROS
                                        var query = `INSERT INTO tb_dados_historicos (qtde_animais_geral, qtde_animais_gestacao, qtde_animais_aptos_alimentar_gestacao, qtde_animais_alimentados_total,
                                qtde_animais_alimentados_parcial, qtde_nao_alimentados_geral, qtde_baias, baia_id, qtde_animais_baia, qtde_animais_aptos_alimentar_baia, qtde_alimentados_total_baia, qtde_alimentados_parcial_baia,
                                qtde_nao_alimentados_baia, qtde_dosadores_baia, qtde_dosadores_geral_ativos, qtde_dosadores_geral_inativos, created)
                             VALUES`;
                                        for (var i = 0; i < rows.length; i++) {
                                            if (i > 0) {
                                                query = query.concat(`, (${rows[i].qtde_animais_geral}, ${rows[i].qtde_animais_gestacao}, ${rows[i].qtde_animais_aptos_alimentar_gestacao}, ${rows[i].qtde_animais_alimentados_total},
                                                          ${rows[i].qtde_animais_alimentados_parcial}, ${rows[i].qtde_nao_alimentados_geral}, ${rows[i].qtde_baias}, ${rows[i].baia_id},
                                                          ${rows[i].qtde_animais_baia}, ${rows[i].qtde_animais_aptos_alimentar_baia}, ${rows[i].qtde_alimentados_total_baia}, ${rows[i].qtde_alimentados_parcial_baia}, ${rows[i].qtde_nao_alimentados_baia},
                                                          ${rows[i].qtde_dosadores_baia}, ${rows[i].qtde_dosadores_geral_ativos}, ${rows[i].qtde_dosadores_geral_inativos}, '${created}')`);
                                            } else {
                                                query = query.concat(`(${rows[i].qtde_animais_geral}, ${rows[i].qtde_animais_gestacao}, ${rows[i].qtde_animais_aptos_alimentar_gestacao}, ${rows[i].qtde_animais_alimentados_total},
                                                          ${rows[i].qtde_animais_alimentados_parcial}, ${rows[i].qtde_nao_alimentados_geral}, ${rows[i].qtde_baias}, ${rows[i].baia_id},
                                                          ${rows[i].qtde_animais_baia}, ${rows[i].qtde_animais_aptos_alimentar_baia}, ${rows[i].qtde_alimentados_total_baia}, ${rows[i].qtde_alimentados_parcial_baia}, ${rows[i].qtde_nao_alimentados_baia},
                                                          ${rows[i].qtde_dosadores_baia}, ${rows[i].qtde_dosadores_geral_ativos}, ${rows[i].qtde_dosadores_geral_inativos}, '${created}')`);
                                            }
                                        }
                                        connection.query(query, function (error2, rows2, fields2) {
                                            connection.release();
                                            if (error2) {
                                                console.log("Erro ao inserir registros no sistema", query);
                                                var data = Moment();
                                                var log_erro_registro_dados = `Status: Erro ao realizar a inserção dos dados no banco: ${error}. | Data: ${data}\n`;
                                                fs.writeFile("./logs_registro_dados.txt", `${log_erro_registro_dados}`, { enconding: "utf-8", flag: "a" },
                                                    function (erro) {
                                                        if (erro) {
                                                            console.log("Erro ao cadastrar log em arquivo.");
                                                            throw erro;
                                                        }
                                                        console.log("Log gravado com êxito.");
                                                    }
                                                );
                                                return;
                                            } else {
                                                var data = Moment();
                                                var log_sucesso = `Status: Registros gravados com sucesso. | Data: ${data}\n`;
                                                fs.writeFile("./logs_registro_dados.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                                    function (erro) {
                                                        if (erro) {
                                                            console.log("Erro ao cadastrar log em arquivo.");
                                                            throw erro;
                                                        }
                                                        console.log("Registros gravados com sucesso.");
                                                    }
                                                );
                                            }
                                        });
                                    }
                                }
                            );
                        } else {
                            var data = Moment();
                            var log_sucesso = `Status: Os registros já foram gravados. | Data: ${data}\n`;
                            fs.writeFile("./logs_registro_dados.txt", `${log_sucesso}`, { enconding: "utf-8", flag: "a" },
                                function (erro) {
                                    if (erro) {
                                        console.log("Erro ao cadastrar log em arquivo.");
                                        throw erro;
                                    }
                                    console.log("Os registros já foram gravados.");
                                }
                            );
                            console.log("Os dados já foram inseridos no banco.")
                        }
                    }
                });

        });
    }, null, true, "America/Sao_Paulo");

/* FIM DO REGISTRO DOS DADOS DA GRANJA NO DIA
 ****************************************************** */

/******************************************************************************************
POPULANDO MODULO
******************************************************************************************/
module.exports = Router;
