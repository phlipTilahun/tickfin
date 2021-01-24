require('custom-env').env('localhost'); // for local databse connection
//require('custom-env').env('heroku'); // for heroku database connection

const {Pool} = require('pg')
const pool = new Pool()


module.exports = pool