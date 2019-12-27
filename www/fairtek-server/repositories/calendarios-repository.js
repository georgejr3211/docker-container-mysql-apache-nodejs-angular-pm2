'use strict';
const Calendario = require('../models/calendario'),
    db = require('../connect/sequelize.connect'),
    sequelize = require('sequelize'),
    Op = sequelize.Op;


exports.create = async function (calendario) {
    return Calendario.create(calendario).catch(sequelize.ValidationError, function (err) {
            // respond with validation errors
            return err;
        })
        .catch(function (err) {
            // every other error
            return err;
        });
}

exports.createMulti = async function (calendarios) {
    return Calendario.create(calendario).then(calendario => {
        return calendario;
    }).catch((err) => {
        return err;
    })

}

exports.findAll = async function () {

    return Calendario.findAll().then(calendarios => {
        return calendarios;
        // projects will be an array of all Project instances
    });

}

exports.findOne = async function (day) {
    return Calendario.findOne({
        where: {
            dt_inicio: {
                lte: sequelize.fn('date_format', `${day}`, '%Y-%m-%d %H:%i:%s'),
            },
            dt_fim: {
                gte: sequelize.fn('date_format', `${day}`, '%Y-%m-%d %H:%i:%s')
            }

        }
    }).then(calendario => {
        return calendario;
    }).catch(err => {
        return err;
    });
}

exports.findRange = async function (startCalendar, endCalendar){
    return Calendario.findAll({
         where:{
             dt_inicio: {
                 [Op.gte]: sequelize.fn('date_format', `${startCalendar}`, '%Y-%m-%d %H:%i:%s'),
             },
             dt_fim: {
                 [Op.lte]: sequelize.fn('date_format', `${endCalendar}`, '%Y-%m-%d %H:%i:%s')
             }
         }
     }).then(calendario => {
        return calendario;
    }).catch(err => {
        return err;
    });
}
