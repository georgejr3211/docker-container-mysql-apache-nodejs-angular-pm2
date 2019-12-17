const dbConnection = require("../config/db");

function getAll() {
  sql = `SELECT id, name FROM users`;
  const conn = dbConnection();
  conn.connect();

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
  conn.connect();

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
