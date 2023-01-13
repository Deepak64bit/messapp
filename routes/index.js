const { query } = require('express');
var express = require('express');
const { response } = require('../app');
var router = express.Router();
var database = require('../sqlConnection')
const session = require('express-session')
function executeAsyncQuery(query) {
  return new Promise((resolve, reject) => {
      database.query(query, (error, elements) => {
          if (error) {
              return reject(error);
          }
          return resolve(elements);
      });
  });
}


/* GET home page. */
router.get('/', async function(req, res, next) {

  console.log(req.session);
  var userType = req.session.userType

  if(userType=="student"){
    res.redirect("/student/")
  } else if(userType=="mess"){
    res.redirect("/mess/")
  }else if(userType == "hostel"){
    res.redirect("/hostel")
  }
  else{
  res.render('about.ejs', {
    session: req.session,
  })
  }
});
router.get('/about', async function(req, res, next) {
  
  res.render('about.ejs', {
    session: req.session,
  })

});

router.get('/contact', async function(req, res, next) {
  
  var query =`select Name, Mess, Contact_No from Mess_Incharge;`
  var mess_incharge = await executeAsyncQuery(query);
  query =  `select Name, Hostel, Contact_No from Hostel_Incharge;`
  var hostel_incharge =  await executeAsyncQuery(query);
  res.render('contact.ejs', {
    session: req.session,
    mess_incharge: JSON.parse(JSON.stringify(mess_incharge)),
    hostel_incharge: JSON.parse(JSON.stringify(hostel_incharge))
  })
  
});

router.post('/', function(req, res, next){
  res.redirect('/login')
})

router.get('/login', function(req, res, next) {

  var userType = req.session.userType
  if(userType=="student"){
    res.redirect("/")
  } else if(userType=="mess"){
    res.redirect("/")
  }else if(userType == "hostel"){
    res.redirect("/")
  }
  else
  res.render('login.ejs', { title: 'Express', session : req.session });
});

router.post('/login', function(req,res,next){
  var userID = req.body.userID;
  var userPassword = req.body.password;
  var userType = req.body.userType;
  var tableName;

  if(userType=="student"){
    tableName="Student"
  } else if(userType=="mess"){
    tableName="Mess_Incharge"
  }else{
    tableName="Hostel_Incharge"
  }
  // console.log(userType)
  
  if(userID && userPassword){
    // console.log(userID)
    // query="SELECT * FROM student WHERE Username='B190431CS'"
    // console.log(userPassword)
    database.query(`SELECT * FROM ${tableName} WHERE Username="${userID}"`, function(error,data,fields){
      // console.log(data)
      if( data.length > 0 ){
        // console.log(userPassword)
        for(var count = 0; count < data.length; count++){
          if(data[count].Password==userPassword){
            // console.log(data[count].userID, userID)
            req.session.userID=data[count].Username
            req.session.userType=userType

            if(userType=="student"){
              res.redirect("/student/")
            } else if(userType=="mess"){
              res.redirect("/mess/")
            }else{
              res.redirect("/hostel")
            }
          }
          else{
            // res.send('<script>alert("Incorrect Credentials")</script>')
            res.send("Incorrect Credentials")
          }
        }
      }
      else{
        // res.send('<script>alert("Incorrect Credentials")</script>')
        res.send("Incorrect Credentials")
      }
      res.end()
    })
  }
  else{
    // res.send('<script>alert("Incorrect Credentials")</script>')
    res.send("Incorrect Credentials")
    res.end()
  }
})

router.get('/logout', function(req,res,next){
  req.session.destroy();
  res.redirect("/login")
})

module.exports = router;
