const { query } = require('express');
var express = require('express');
const { response } = require('../app');
var router = express.Router();
var database = require('../sqlConnection')
const session = require('express-session')
var messages = []
// var r;

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

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.session)
  if(req.session.userID){
    res.render('student_home.ejs', { title: 'Express', session : req.session ,messages:messages});
    messages = []
  } else{
    res.redirect('../login')
  }
});

router.get('/payDues', async function(req, res, next) {
  if(req.session.userID){
    var userID = req.session.userID;

    var query = `SELECT Name FROM Student WHERE Roll_No="${userID}";`
    var name = await executeAsyncQuery(query)
    name = JSON.parse(JSON.stringify(name))[0]

    query = `SELECT Dues FROM Student_Dues WHERE Student_Roll_No="${userID}";`
    var dues = await executeAsyncQuery(query)
    dues = JSON.parse(JSON.stringify(dues))[0]
      
    res.render('student_pay_dues.ejs', { name : name.Name , dues : dues.Dues ,session : req.session });
    
  }else{
    res.redirect('/student')
  }
});

router.post('/payDues', async function(req, res, next){
  if(req.session.userID){
    var userID = req.session.userID;

    var query = `UPDATE Student_Dues SET Dues=0 WHERE Student_Roll_No="${userID}";`
    var a = await executeAsyncQuery(query)
      
    res.redirect('/student');
    
  }else{
    res.redirect('/student')
  }
})

router.get('/chooseMess', async function(req, res, next) {
  if(req.session.userID){

    var userID = req.session.userID
    var query = `SELECT Hostel, Per_day_cost, Total_Capacity FROM Mess;`
    var mess_details = await executeAsyncQuery(query)
    mess_details = JSON.parse(JSON.stringify(mess_details))
    // mess_details[0].rem = '20';

    for(var i=0; i<mess_details.length; i++){
      query = `SELECT COUNT(Student_Roll_No) AS Total FROM Student_Mess WHERE Mess="${mess_details[i].Hostel}";`
      var no_of_students = await executeAsyncQuery(query)
      no_of_students = JSON.parse(JSON.stringify(no_of_students))[0]
      var remaining = Number(mess_details[i].Total_Capacity) - Number(no_of_students.Total)
      // console.log(no_of_students, mess_details[i].Total_Capacity, remaining)

      // check condition
      mess_details[i].remaining = remaining
    }
    // console.log(mess_details)
    query = `Select * FROM Student_Mess WHERE Student_Roll_No="${userID}";`
    var student_mess = await executeAsyncQuery(query)
    student_mess = JSON.parse(JSON.stringify(student_mess))
    // console.log(student_mess)
    if(student_mess.length > 0){
      console.log(student_mess)
      messages.push({
        text: 'Cannot access :Mess already chosen'
      })
      res.redirect('/')
    }

    query =  `Select * FROM  Start_End_Date ;`
    var student_access= await executeAsyncQuery(query)
    student_access = JSON.parse(JSON.stringify(student_access))
    var is_student_access = false
    query =  `Select * FROM  Student_Dues WHERE Student_Roll_No="${userID}";`
    var pay_status= await executeAsyncQuery(query)
    pay_status= JSON.parse(JSON.stringify(pay_status))[0]
    if(student_access.length > 0)
    {
      // console.log(student_access[0].Start)
      
      var start =new Date(student_access[0].Start)
      var end = new Date(student_access[0].End)
      var now = new Date()
      console.log(now)
      console.log(start)
      console.log(end)
      console.log(start< now && end > now)
      if(start< now && end > now && pay_status.Dues==0){
      res.render('student_choose_mess.ejs', { mess_details: mess_details, session : req.session });
      }
      else{
        messages.push({
          text: 'Cannot access :Check your payment status or return during payment active period.'
        })
        res.redirect('/')
      }
    }
    
  }else{
    res.redirect('../login')
  }
});

router.post('/chooseMess', function(req, res, next) {
  console.log("adas")
  console.log(req.session)
  if(req.session.userID){
    var userID = req.session.userID;
    var chosenMess = req.body.mess;

    database.query(`INSERT INTO Student_Mess VALUES( "${userID}", "${chosenMess}",30)`, function(error,data,fileds){
      if (error) throw error;
      req.session.chosenMess=chosenMess;
      console.log("Student inserted ");
      res.redirect("/student")
    })

  }else{
    console.log("yes")
    res.redirect('/student')
  }
})

module.exports = router;
