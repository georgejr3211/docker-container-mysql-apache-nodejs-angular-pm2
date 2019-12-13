const mysql = require("mysql");

function dbConnection() {
  return mysql.createConnection({
    host: "my-db",
    user: "root",
    password: "root",
    database: "db",
    port: 3306
  });
}

function getAll() {
  sql = `SELECT id, name FROM users`;
  const conn = dbConnection();

  return new Promise((resolve, reject) => {
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);

      conn.end();
    });
  });
}

async function createUser(name) {
  sql = `INSERT INTO users (name) VALUES ('${name}')`;
  const conn = dbConnection();

  return new Promise((resolve, reject) => {
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);

      conn.end();
    });
  });
}

module.exports = {
  getAll,
  createUser
};
