var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlpassword",
  database: "messManagement"
});

con.connect(function(err) {
    if (err){
        throw err;
    }
    else{
        console.log('Successfully connected to the database');
    }
  });

  module.exports=con;
