/** Sequelize ORM */
'use strict';

const Sequelize = require('sequelize');
var db = require('../connect/db');

module.exports = new Sequelize(db.config.database, db.config.user, db.config.password, {
    host: db.config.host,
    dialect: 'mysql',
});