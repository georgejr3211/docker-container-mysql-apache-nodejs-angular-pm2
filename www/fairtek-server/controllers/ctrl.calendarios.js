/******************************
MODULOS EXPRESS
******************************/
var express = require('express');
var Moment = require('../utils/moment');
var Router = express.Router();
var Calendario = require('../repositories/calendarios-repository');

/******************************
MONGODB
******************************/
var db = require('../connect/db');
var mysql = require('mysql');
var poolQuery = mysql.createPool(db.config);


/*
FUNCTIONS
*/

async function returnCalendario(calendarios, calendario, req) {

    if (calendarios.length > 0) {

        if (typeof calendarios[i - 1].dt_fim !== 'undefined' && calendarios[i - 1].dt_fim !== '') {

            calendario.dt_inicio = Moment(calendarios[i - 1].dt_fim).add(1, 'days').format('YYYY-MM-DD');
            calendario.dt_fim = Moment(calendario.dt_inicio).add(999, 'days').format('YYYY-MM-DD');

        } else {

            res.status(200).send({
                errors: [{
                    error: 'calendario < 0'
                }]
            });

        }

    } else {

        calendario.dt_inicio = Moment(req.dt_inicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
        calendario.dt_fim = Moment(calendario.dt_inicio).add(999, 'days').format('YYYY-MM-DD');

    }

    return await calendario;

}

/* FUNCTION POPULA dt_calendarios */
async function configuraCalendario(req) {
    var calendarios = [];

    var result = {};
    if (typeof req.dt_inicio !== 'undefined' && req.dt_inicio != '' && req.dt_inicio != null) {
        for (i = 1; i <= 50; i++) {

            var calendario = {
                dt_inicio: '',
                dt_fim: '',
                created_at: Moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: Moment().format('YYYY-MM-DD HH:mm:ss')
            }

            var addCalendario = await returnCalendario(calendarios, calendario, req);

            calendarios.push(addCalendario);
        }
    }
    return await calendarios;
}

async function returnDayMoment(calendario, day) {

    if (day > 0) {
        return await Moment(calendario.dt_inicio, 'YYYY-MM-DD').add(day, 'days')
    } else {
        return await Moment(calendario.dt_inicio, 'YYYY-MM-DD');
    }

}


async function returnCalendarDayObj(dt_inicio, day, num_calendario) {

    var calendar = {};
    if (day < 10) day = `00${day}`;
    else if (day >= 10 && day < 100) day = `0${day}`;
    if (i = 0) {

        calendar = {
            title: `${num_calendario}.${day}`,
            start: await Moment(dt_inicio, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            num_calendar: num_calendario,
            allDay: false
        }
    } else {

        calendar = {
            title: `${num_calendario}.${day}`,
            start: await Moment(dt_inicio, 'YYYY-MM-DD').add(day, 'days').format('YYYY-MM-DD'),
            num_calendar: num_calendario,
            allDay: false

        }
    }

    return await calendar;


}

async function returnCalendarDays(calendario) {

    var dt_inicio = Moment(calendario.dt_inicio, 'YYYY-MM-DD');
    var dt_fim = Moment(calendario.dt_fim, 'YYYY-MM-DD');

    var result = dt_fim.diff(dt_inicio, 'days');

    var calendarDays = [];

    for (let i = 0; i <= 999; i++) {
        var calendar = await returnCalendarDayObj(calendario.dt_inicio, i);
        calendarDays.push(calendar);
    }

    return await calendarDays;

}

/******************************
ROTA POST OU LIST(GET)
******************************/
Router.route('/')
    .get(function (req, res, next) {
        poolQuery.getConnection(function (err, connection) {
            connection.query(`SELECT id, dt_inicio, dt_fim FROM tb_calendarios`,
                function (error, rows, fields) {

                    connection.release();

                    if (error) {
                        res.status(400).send({
                            message: error.message
                        })
                    } else {

                        if (rows.length > 0) {
                            res.status(200).send(rows)
                        } else {
                            res.status(200).send([])
                        }

                    }

                });
        });
    })
    /* popula a tb_calendarios (1000 dias) */
    .post(async function (req, res, next) {

        if (req.body.dt_inicio != null && req.body.dt_inicio != '' && typeof req.body.dt_inicio != 'undefined') {

            var calendarios = await configuraCalendario(req.body);

            var error = '';
            var result = false;

            for (i in calendarios) {
                result = Calendario.create(calendarios[i]).then(
                    (calendario) => {

                        if (typeof calendario.errors != 'undefined') {
                            res.status(422).send(calendario.original);
                            return calendario;
                        }
                        return true;
                    }
                ).catch(
                    (err) => {
                        res.status(422).send(err);
                        return err;
                    }
                );
            }
            if (result) {
                res.status(201).send({
                    message: 'Calendarios criados com sucesso!'
                })
            }

        } else {
            res.status(200).send({
                errors: [{
                    error: 'dt_inicio não informada'
                }]
            })
        }

    });

Router.route('/findone/:day').get(async function (req, res, next) {
    if (req.params.day != null && req.body.day != '' && typeof req.params.day != 'undefined') {
        Calendario.findOne(req.params.day).then(
            result => {
                if (result === null) {
                    res.status(200).send([]);
                } else {
                    resultCalendarDays = returnCalendarDays(result).then(data => {
                        res.status(200).send(data);
                    })
                }
            }
        )
    } else {
        res.status(200).send({
            errors: [{
                error: 'day não informada'
            }]
        })
    }

});

Router.route('/findall').get(async function (req, res, next) {

    var calendarios = await Calendario.findAll().then(
        result => {
            return result;
        }
    )
    var days;
    try {
        var calendarsDays = []

        calendarios.forEach(async function (calendario) {


            var dt_inicio = Moment(calendario.dt_inicio, 'YYYY-MM-DD');
            var dt_fim = Moment(calendario.dt_fim, 'YYYY-MM-DD');

            var result = dt_fim.diff(dt_inicio, 'days');
            for (let i = 0; i <= 999; i++) {
                var calendar = await returnCalendarDayObj(calendario.dt_inicio, i, (calendario.id - 1))
                calendarsDays.push(calendar);

            }
            if (calendarsDays.length == 50000) {
                res.send(calendarsDays);
            }
        })
    }
    catch (err) {
        console.log(err)
    }

});

Router.route('/findRangeCalendar/:date/:range').get(async function (req, res, next) {

    console.log('range', req.params.range)
    let startCalendar = Moment(req.params.date).add(-req.params.range,'years').format('YYYY-MM-DD')
    let endCalendar = Moment(req.params.date).add(req.params.range,'years').format('YYYY-MM-DD')
    var calendarios = await Calendario.findRange(startCalendar, endCalendar).then(
        result => {
            return result;
        }
    )
    var days;
    try {
        var calendarsDays = []
        calendarios.forEach(async function (calendario) {
            var dt_inicio = Moment(calendario.dt_inicio, 'YYYY-MM-DD');
            var dt_fim = Moment(calendario.dt_fim, 'YYYY-MM-DD');

            var result = dt_fim.diff(dt_inicio, 'days');
            for (let i = 0; i <= 999; i++) {
                var calendar = await returnCalendarDayObj(calendario.dt_inicio, i, (calendario.id - 1))
                calendarsDays.push(calendar);

            }
            if (calendarsDays.length == (calendarios.length*1000)) {
                res.send(calendarsDays);
            }
        })
    }
    catch (err) {
        console.log(err)
    }

});


module.exports = Router;