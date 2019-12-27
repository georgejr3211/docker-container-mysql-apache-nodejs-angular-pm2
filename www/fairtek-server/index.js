/******************************************************************************************
MODULOS EXPRESS
******************************************************************************************/
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jwt = require('express-jwt');
var config = require('./config');
var morgan = require("morgan");
let cors = require('cors');



/******************************************************************************************
BODY TO JSON

Conversão dos dados recebidos para o formato JSON
******************************************************************************************/
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/******************************************************************************************
CORS

Habilitando e restringindo tipo de informações enviadas e recebidas no HEAD
******************************************************************************************/
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "HEAD,OPTIONS,GET,POST,PUT,DELETE");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType, Content-Type, Accept, Authorization");
//     next();
// });

app.use(cors());
/**
 * MORGAN LOGS
 */

app.use(morgan("common"));

/******************************************************************************************
ROTAS

Roteamento de funções recidas do AngularJS
******************************************************************************************/


var jwtCheck = jwt({
    secret: config.secretKey,
    fail: function (req, res) {
        if (!req.headers.authorization) {
            res.send(401, 'No authorization token was found');
        }
        res.send(401);
    }
});


//CRASHED APPLICATION
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({
            error: 'Something failed!'
        })
    } else {
        next(err)
    }
}

app.use(clientErrorHandler);

//ROTA INICIAL
app.get('/', function (req, res, next) {
    res.status(200).send('Servidor operando normalmente');
});

//ROTA PING
app.get('/ping', function (req, res, next) {
    res.status(200).send({
        ping: "ping"
    });
});

//CONTROLLERS
var ctrlProdutores = require('./controllers/ctrl.produtores');
app.use('/produtores', jwtCheck, ctrlProdutores);

var ctrlVeterinarios = require('./controllers/ctrl.veterinarios');
app.use('/veterinarios', jwtCheck, ctrlVeterinarios);

var ctrlNutricionistas = require('./controllers/ctrl.nutricionistas');
app.use('/nutricionistas', jwtCheck, ctrlNutricionistas);

var ctrlGerentes = require('./controllers/ctrl.gerentes');
app.use('/gerentes', jwtCheck, ctrlGerentes);

var ctrlOperadores = require('./controllers/ctrl.operadores');
app.use('/operadores', jwtCheck, ctrlOperadores);

var ctrlGeneticas = require('./controllers/ctrl.geneticas');
app.use('/geneticas', jwtCheck, ctrlGeneticas);

var ctrlFazendas = require('./controllers/ctrl.fazendas');
app.use('/fazendas', jwtCheck, ctrlFazendas);

var ctrlGranjas = require('./controllers/ctrl.granjas');
app.use('/granjas', jwtCheck, ctrlGranjas);

var ctrlGalpoes = require('./controllers/ctrl.galpoes');
app.use('/galpoes', jwtCheck, ctrlGalpoes);

var ctrlBaias = require('./controllers/ctrl.baias');
app.use('/baias', jwtCheck, ctrlBaias);

var ctrlDosadores = require('./controllers/ctrl.dosadores');
app.use('/dosadores', jwtCheck, ctrlDosadores);

var ctrlAnimais = require('./controllers/ctrl.animais');
app.use('/animais', jwtCheck, ctrlAnimais);

var ctrlAnimaisSupervisorio = require('./controllers/ctrl.animais.supervisorio');
app.use('/animais-supervisorio', jwtCheck, ctrlAnimaisSupervisorio);

var ctrlMovimentacoes = require('./controllers/ctrl.animais.movimentacoes');
app.use('/animais-movimentacoes', jwtCheck, ctrlMovimentacoes);

var ctrlTiposDietas = require('./controllers/ctrl.dietas.tipos');
app.use('/tipos-dietas', jwtCheck, ctrlTiposDietas);

var ctrlDietas = require('./controllers/ctrl.dietas');
app.use('/dietas', jwtCheck, ctrlDietas);

var ctrlDietasHistorico = require('./controllers/ctrl.dietas.historico');
app.use('/dietas-historico', jwtCheck, ctrlDietasHistorico);

var ctrlAnimaisDietas = require('./controllers/ctrl.animais.dietas');
app.use('/animais-dietas', jwtCheck, ctrlAnimaisDietas);

var ctrlDietasDias = require('./controllers/ctrl.dietas.dias');
app.use('/dietas-dias', jwtCheck, ctrlDietasDias);

var ctrlTiposNotificacao = require('./controllers/ctrl.notificacoes.tipos');
app.use('/tipos-notificacao', jwtCheck, ctrlTiposNotificacao);

var ctrlNotificacoes = require('./controllers/ctrl.notificacoes');
app.use('/notificacoes', jwtCheck, ctrlNotificacoes);

var ctrlRegistros = require('./controllers/ctrl.registros');
app.use('/registros', jwtCheck, ctrlRegistros);

var ctrlUsuarios = require('./controllers/ctrl.usuarios');
app.use('/usuarios', ctrlUsuarios);

var ctrlPerfilUsuarios = require('./controllers/ctrl.grupo.usuarios');
app.use('/grupo-usuarios', jwtCheck, ctrlPerfilUsuarios);

var ctrlLogin = require('./controllers/ctrl.login');
app.use('/login', ctrlLogin);

var ctrlAbrirRede = require('./controllers/ctrl.abrir.rede');
app.use('/abrir-rede', jwtCheck, ctrlAbrirRede);

var ctrlDashboard = require('./controllers/ctrl.dashboard');
app.use('/dashboard', jwtCheck, ctrlDashboard);

var ctrlRegistrosAlimenticios = require('./controllers/ctrl.registros-alimenticios');
app.use('/registros-alimenticios', jwtCheck, ctrlRegistrosAlimenticios);

var ctrlCalendarios = require('./controllers/ctrl.calendarios');
app.use('/calendarios', ctrlCalendarios);

var ctrlEscores = require('./controllers/ctrl.escores');
app.use('/escores', jwtCheck, ctrlEscores);

var ctrlChips = require('./controllers/ctrl.chips');
app.use('/chips', jwtCheck, ctrlChips);

var ctrlDesativacao = require('./controllers/ctrl.desativacao');
app.use('/desativacao', jwtCheck, ctrlDesativacao);

var ctrlSetoresTipos = require('./controllers/ctrl.setores.tipos');
app.use('/setores-tipos', jwtCheck, ctrlSetoresTipos);

var ctrlRelatorioRotina = require('./controllers/ctrl.relatorio.rotina');
app.use('/relatorio-rotina', jwtCheck, ctrlRelatorioRotina);

var ctrlRelatorioAlimentados = require('./controllers/ctrl.relatorio.alimentados');
app.use('/relatorio-alimentados', jwtCheck, ctrlRelatorioAlimentados);

var ctrlAnimaisLocalizacao = require('./controllers/ctrl.animais.localizacao');
app.use('/animais-localizacao', jwtCheck, ctrlAnimaisLocalizacao);

var ctrlConsumoRacao = require('./controllers/ctrl.consumo.racao');
app.use('/consumo-racao', jwtCheck, ctrlConsumoRacao);

var ctrlAnimaisExterna = require('./controllers/ctrl.animais.externa');
app.use('/animais-externa', jwtCheck, ctrlAnimaisExterna);

var ctrlHistoricoSemanal = require('./controllers/ctrl.historico.semanal');
app.use('/historico-semanal', jwtCheck, ctrlHistoricoSemanal);

var ctrlAnimaisGestacao = require('./controllers/ctrl.animais.gestacao');
app.use('/animais-gestacao', jwtCheck, ctrlAnimaisGestacao);

var ctrlAnimaisNaGestacao = require('./controllers/ctrl.animais.em.gestacao');
app.use('/animais-em-gestacao', jwtCheck, ctrlAnimaisNaGestacao);

var ctrlDietasRelatorio = require('./controllers/ctrl.dietas.relatorio');
app.use('/dietas-relatorio', jwtCheck, ctrlDietasRelatorio);

var ctrlAnimaisAlimentadosHoje = require('./controllers/ctrl.animais.alimentados.hoje');
app.use('/animais-alimentados-hoje', jwtCheck, ctrlAnimaisAlimentadosHoje);

var ctrlUtils = require('./controllers/ctrl.utils');
app.use('/utils', jwtCheck, ctrlUtils);

var ctrlCalibracao = require('./controllers/ctrl.calibracao');
app.use('/calibracao', jwtCheck, ctrlCalibracao);

var ctrlCron = require('./controllers/ctrl.cron');
app.use('/cron', jwtCheck, ctrlCron);

var ctrlAnimaisTransferenciasBaias = require('./controllers/ctrl.animais.transferencias.baias');
app.use('/animais-transferencias-baias', jwtCheck, ctrlAnimaisTransferenciasBaias);


/******************************************************************************************
RODANDO SERVER

Server Start
******************************************************************************************/
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App operando normalmente na porta", port);
});