'use strict'
var Sequelize = require('sequelize');
var config = require('../config'),
    db = require('../connect/sequelize.connect');

var Calendario = db.define('tb_calendarios', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dt_inicio: {
        type: Sequelize.DATE
    },
    dt_fim: {
        type: Sequelize.DATE
    },
    created_at: {
        type: Sequelize.DATE
    },
    updated_at: {
        type: Sequelize.DATE
    }
}, {
    indexes: [{
        unique: true,
        fields: ['dt_inicio', 'dt_fim']
    }],
    underscored: true, //underscored: true indicates the the column names of the database tables are snake_case rather than camelCase.
    /* freezeTableName: true */ // to remove default append "s" in table name */
});

module.exports = Calendario;