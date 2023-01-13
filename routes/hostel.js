var express = require('express');
var router = express.Router();
var database = require('../sqlConnection')

function excequteAsyncQuery(query) {
  return new Promise((resolve, reject) => {
      database.query(query, (error, elements) => {
          if (error) {
              return reject(error);
          }
          return resolve(elements);
      });
  });
}

function reverseString(str) {
  return str.split("-").reverse().join("-");
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  // console.log(req.session)
  if(req.session.userID){
    var userID = req.session.userID
    var query = `SELECT * FROM Start_End_Date;`
    var date = await excequteAsyncQuery(query)
    date = JSON.parse(JSON.stringify(date))[0]
    // console.log(date)

    try{
      var startDate = new Date(date.Start);
      startDate.setDate(startDate.getDate());
      var start_date = startDate.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];

      var endDate = new Date(date.End);
      endDate.setDate(endDate.getDate());
      var end_date = endDate.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];

      query = `SELECT Hostel FROM Hostel_Incharge WHERE Username="${userID}";`
      var hostelName = await excequteAsyncQuery(query)
      hostelName = JSON.parse(JSON.stringify(hostelName))[0]

      query = `SELECT COUNT(*) AS Total FROM Student_Hostel WHERE Hostel="${hostelName.Hostel}" ;`
      var no_of_students = await excequteAsyncQuery(query)
      no_of_students = JSON.parse(JSON.stringify(no_of_students))[0]
      // console.log(no_of_students)

      res.render('Hostel_home_page.ejs', { start_date: reverseString(start_date) , end_date : reverseString(end_date)  , no_of_students : no_of_students.Total , hostelName : hostelName.Hostel , session : req.session });
    } catch(err) {
      query = `SELECT Hostel FROM Hostel_Incharge WHERE Username="${userID}";`
      var hostelName = await excequteAsyncQuery(query)
      hostelName = JSON.parse(JSON.stringify(hostelName))[0]

      query = `SELECT COUNT(*) AS Total FROM Student_Hostel WHERE Hostel="${hostelName.Hostel}" ;`
      var no_of_students = await excequteAsyncQuery(query)
      no_of_students = JSON.parse(JSON.stringify(no_of_students))[0]
      // console.log(no_of_students)

      res.render('Hostel_home_page.ejs', { start_date: "" , end_date : "" , no_of_students : no_of_students.Total , hostelName : hostelName.Hostel , session : req.session });
    }

  } else{
    res.redirect('../login')
  }
});

router.get('/hostelDues', async function(req, res, next) {
    if(req.session.userID){
      var userID = req.session.userID;

      var query = `SELECT Hostel FROM Hostel_Incharge WHERE Username="${userID}";`
      var hostel = await excequteAsyncQuery(query)
      hostel = JSON.parse(JSON.stringify(hostel))[0]

      query = `SELECT Student_Roll_No FROM Student_Hostel WHERE Hostel="${hostel.Hostel}";`
      var roll_numbers = await excequteAsyncQuery(query)
      roll_numbers = JSON.parse(JSON.stringify(roll_numbers))

      for(var i=0; i<roll_numbers.length; i++){
        query = `SELECT Name FROM Student WHERE Username="${roll_numbers[i].Student_Roll_No}";`
        var name = await excequteAsyncQuery(query)
        name = JSON.parse(JSON.stringify(name))[0]

        query = `SELECT Dues FROM Student_Dues WHERE Student_Roll_No="${roll_numbers[i].Student_Roll_No}";`
        var dues = await excequteAsyncQuery(query)
        dues = JSON.parse(JSON.stringify(dues))[0]

        roll_numbers[i].name = name.Name
        roll_numbers[i].dues = dues.Dues
      }
      console.log(roll_numbers)

      res.render('hostel_dues.ejs',{ roll_numbers : roll_numbers , session : req.session });
    } else{
        res.redirect('../login')
      }
});

router.post('/hostelDues', async function(req, res, next) {
  if(req.session.userID){
    var userID = req.session.userID;
    var no_of_days = req.body.day;
    var hostel_charge = req.body.charge;
    var hostel_dues = Number(no_of_days)*Number(hostel_charge);
    console.log(hostel_dues)

    var query = `SELECT Hostel FROM Hostel_Incharge WHERE Username="${userID}";`
    var hostel = await excequteAsyncQuery(query)
    hostel = JSON.parse(JSON.stringify(hostel))[0]

    var query = `UPDATE Student_Hostel SET No_of_days=${no_of_days} WHERE Hostel="${hostel.Hostel}";`
    var a = await excequteAsyncQuery(query)

    query = `UPDATE Hostel SET Per_day_cost=${hostel_charge} WHERE Name="${hostel.Hostel}";`
    a = await excequteAsyncQuery(query)
    
    res.redirect('/hostel/hostelDues')
    // res.render('hostel_dues.ejs', { session : req.session });
  
  } else{
    res.redirect('../login')
  }
});

router.get('/studentAccessibility', async function(req, res, next) {
  var query =  `Select * FROM  Start_End_Date ;`
  var student_access= await excequteAsyncQuery(query)
  student_access = JSON.parse(JSON.stringify(student_access))
  var is_student_access = false
  if(student_access.length > 0)
  {
    console.log(student_access[0].Start)
    
    var start =new Date(student_access[0].Start)
    var end = new Date(student_access[0].End)
    var now = new Date()
    console.log(now)
    console.log(start)
    console.log(start< now && end > now)
    if(start< now && end > now)
      is_student_access = true
  }
    if(req.session.userID){
        res.render('Hostel_studentaccessibility.ejs', { 
          title: 'Express', session : req.session,
          is_student_access : is_student_access
        });
    } else{
        res.redirect('../login')
      }
  });

router.post('/studentAccessibility', function(req, res, next) {
  console.log("adas")
  console.log(req.session)
  if(req.session.userID){
    var userID = req.session.userID;
    var start = req.body.start;
    var end = req.body.end;


    database.query(`UPDATE Start_End_Date SET Start= "${start}",End= "${end}" WHERE Id = 1; `, function(error,data,fileds){
      if (error) throw error;
      console.log("Start and End dates updated ");
      res.redirect("/hostel")
    })

  }else{
    console.log("yes")
    res.redirect('/hostel')
  }
})

router.get('/changePassword', function(req, res, next) {
    if(req.session.userID){
      var userID=req.session.userID;

        res.render('Hostel_ChangePassword.ejs', { title: 'Express', session : req.session });
    } else{
        res.redirect('../login')
      }
});

router.post('/changePassword/hostelPass', function(req, res, next){
  var currpwd = req.body.currhostelpwd
  var newpwd = req.body.newhostelpwd
  var confpwd = req.body.confhostelpwd
  var userID = req.session.userID
  // console.log(confpwd,userID)

  database.query(`UPDATE Hostel_Incharge SET Password = "${confpwd}" WHERE Username = "${userID}"`,function(error,data,fields){
    if(error) throw error;
    //any way to alert and use javascript
    res.redirect('/hostel/')
  })  
})

router.post('/changePassword/mess', async function(req, res, next){
  // console.log(req.body)
  var newpwd = req.body.newmesspwd
  var confpwd = req.body.confmesspwd
  var userID = req.session.userID
  var query = `SELECT Hostel FROM Hostel_Incharge WHERE Username = "${userID}";`
  var messName = await excequteAsyncQuery(query)
  messName = JSON.parse(JSON.stringify(messName))[0]
  // console.log(messName)

  database.query(`UPDATE Mess_Incharge SET Password = "${confpwd}" WHERE Mess = "${messName.Hostel}"`,function(error,data,fields){
    if(error) throw error;
    //any way to alert and use javascript
    res.redirect('/hostel/')
  })  
})

router.post('/changePassword/student', function(req, res, next){
  console.log(req.body)
  var rollNo = req.body.rollnum
  var newpwd = req.body.newstudentpwd
  var confpwd = req.body.confstudentpwd
  var userID = req.session.userID
  // var query = `SELECT Hostel FROM Hostel_Incharge WHERE Username = "${userID}";`
  // var messName = await excequteAsyncQuery(query)
  // console.log(confpwd,userID)

  database.query(`UPDATE Student SET Password = "${confpwd}" WHERE Username = "${rollNo}"`,function(error,data,fields){
    if(error) throw error;
    //any way to alert and use javascript
    res.redirect('/hostel/')
  })  
})

module.exports = router;
