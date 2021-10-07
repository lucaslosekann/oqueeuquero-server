const mysql = require('mysql2');
const dbConfig = require('../config/db.config.js')
const pool  = mysql.createPool(dbConfig);
//Setup connection with database so we can use it later through the pool object


//Listen to databse events and log it if there is an error
pool.on('connection', function (connection) {
  connection.on('error', function (err) {
    console.error(new Date(), 'Database error', err.code);
  });
  connection.on('close', function (err) {
    console.error(new Date(), 'Database closed', err);
  });
});

setupDatabase();
//Exports the pool object to the node enviroment
exports.pool = pool;

//Setup the database creating all the necessary tabls
async function setupDatabase (){
  try{
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS roles(
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(30) NOT NULL
      )`
    )
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS users(
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(45) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role_id INT UNSIGNED NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )`
    )
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS lists(
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        ref VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(40) NOT NULL,
        showPix BOOLEAN NOT NULL DEFAULT FALSE,
        showAddress BOOLEAN NOT NULL DEFAULT FALSE,
        private BOOLEAN NOT NULL DEFAULT FALSE,
        code CHAR(5) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INT UNSIGNED NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    )
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS list_items(
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(50) NOT NULL,
        checked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        list_id INT UNSIGNED NOT NULL,
        FOREIGN KEY (list_id) REFERENCES lists(id)
        ON DELETE CASCADE
      )`
    )
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS links(
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        link VARCHAR(255) NOT NULL,
        list_item_id INT UNSIGNED NOT NULL,
        FOREIGN KEY (list_item_id) REFERENCES list_items(id)
        ON DELETE CASCADE
      )`
    )
    console.log('Database setup done!')
  }catch(e){
    console.log(e);
  }
}