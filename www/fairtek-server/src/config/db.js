const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "172.19.0.3",
  user: "root",
  password: "root",
  database: "db",
  port: 3306
});

module.exports = connection;
