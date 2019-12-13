const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "db"
});

app.use(cors());

app.get("/", (req, res) => {
  try {
    connection.connect();

    let sql = `CREATE TABLE users IF NOT EXISTS (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      PRIMARY KEY(id)
    )`;

    connection.query(sql);

    sql = `INSERT INTO users (name) VALUES ('George')`;

    connection.query(sql);

    sql = `SELECT id, name FROM users`;

    connection.query(sql, (error, result, fields) => {
      if (error) throw error;

      console.log("Result", result);
      console.log("fields", fields);
    });

    connection.end();
  } catch (error) {}
});

app.listen(port, () => console.log("Server ON " + port));
