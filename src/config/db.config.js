//Connection configuration for the database
module.exports = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
  port: 3306,
  multipleStatements: true,
}