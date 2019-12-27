const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const notifier = require('./notifications_cloud')
//Scopo - Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const PATH = process.cwd();

//TOKEN gerado
const TOKEN_PATH = PATH + '/cloud/auth/token.json';

//OBJETO GLOBAL PARA CORPO DE NOTIFICAÇÕES E LOGS
let notif = {
    status: '',
    detalhes: '',
    tb_notificacoes_tipos_id: ''
}

const oauth2Client = new google.auth.OAuth2(
    "691830919926-5cf7hm07capm5dr3f737gai9s5cbe3kq.apps.googleusercontent.com",
    "mN8ux8UGlGjaSe-I540k_0rj",
    "http://localhost"
);
exports.driveUpload = (name) => {
    fs.readFile(PATH + '/cloud/auth/credentials.json', (err, content) => {
        if (err) {
            notif.status = 'ERRO';
            notif.detalhes = 'ERRO AO FAZER O BACKUP EM NUVEM :' + err.message;
            notif.tb_notificacoes_tipos_id = 24

            notifier.postLogs(notif);
            return console.log('Erro ao carregar secret_client:', err);

        }
        authorize(JSON.parse(content), uploadFile);
    });

    function authorize(credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                notif.status = 'ERRO';
                notif.detalhes = 'ERRO AO FAZER O BACKUP EM NUVEM :' + err;
                notif.tb_notificacoes_tipos_id = 24

                notifier.postLogs(notif);
                return getAccessToken(oAuth2Client, callback);
            }
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Autorize a aplicação a consumir a url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    notif.status = 'ERRO';
                    notif.detalhes = 'ERRO AO FAZER O BACKUP EM NUVEM :' + err;
                    notif.tb_notificacoes_tipos_id = 24

                    notifier.postLogs(notif);
                    return console.error('Error retrieving access token', err)

                };
                oAuth2Client.setCredentials(token);

                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) {
                        console.error(err)
                        notif.status = 'ERRO';
                        notif.detalhes = 'ERRO AO FAZER O BACKUP EM NUVEM :' + err;
                        notif.tb_notificacoes_tipos_id = 24

                        notifier.postLogs(notif);
                    };
                    console.log('Token armazenado em: ', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
    function uploadFile(auth) {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const fileMetadata = {
            'name': name,
            'parents': ['1U6hc5H9fURQEmNWUyps0T8_zH199o1bg']
        };
        var media = {
            mimeType: 'text/sql',
            body: fs.createReadStream(PATH + `/dump_days/${name}`)
        };

        drive.files.create({
            auth: auth,
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {



            if (err) {
                // Handle error
                notif.status = 'ERRO';
                notif.detalhes = 'ERRO AO FAZER O BACKUP EM NUVEM :' + err.message;
                notif.tb_notificacoes_tipos_id = 24

                notifier.postLogs(notif);
                console.error(err);
            } else {
                notif.status = 'SUCESSO';
                notif.detalhes = 'BACKUP EM NUVEM REALIZADO COM SUCESSO :';
                notif.tb_notificacoes_tipos_id = 23

                notifier.postLogs(notif);
                console.log('Backup Armazenado em Cloud com êxito: ', file.id);
            }
        });
    }
}