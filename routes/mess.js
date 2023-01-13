var express = require('express');
var router = express.Router();
var database = require('../sqlConnection')

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

function reverseString(str) {
  return str.split("-").reverse().join("-");
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
//   console.log(req.session)
  if(req.session.userID){
    var userID = req.session.userID
    var query = `SELECT * FROM Start_End_Date;`
    var date = await executeAsyncQuery(query)
    date = JSON.parse(JSON.stringify(date))[0]
    try{
      var deadlineDate = new Date(date.Start);
      deadlineDate.setDate(deadlineDate.getDate() - 2);
      var deadline = deadlineDate.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];

      var startDate = new Date(date.Start);
      startDate.setDate(startDate.getDate());
      var start_date = startDate.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];

      var endDate = new Date(date.End);
      endDate.setDate(endDate.getDate());
      var end_date = endDate.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];
    // console.log(typeof(deadline))

      var query = `SELECT Mess FROM Mess_Incharge WHERE Username="${userID}";`
      var mess = await executeAsyncQuery(query)
      mess = JSON.parse(JSON.stringify(mess))[0]
      
      res.render('mess_incharge.ejs', { start_date: reverseString(start_date) , end_date : reverseString(end_date) , deadline : reverseString(deadline) , messName : mess.Mess  , session : req.session });
    } catch(err) {
      var query = `SELECT Mess FROM Mess_Incharge WHERE Username="${userID}";`
      var mess = await executeAsyncQuery(query)
      mess = JSON.parse(JSON.stringify(mess))[0]
      console.log("***********")
      res.render('mess_incharge.ejs', { start_date: "" , end_date : "" , deadline : "" , messName : mess.Mess  , session : req.session });
    }
  } else{
    res.redirect('../login')
  }
});

router.get('/messDues', async function(req, res, next) {
    if(req.session.userID){
      var userID = req.session.userID

      var query = `SELECT Mess FROM Mess_Incharge WHERE Username="${userID}";`
      var mess = await executeAsyncQuery(query)
      mess = JSON.parse(JSON.stringify(mess))[0]
      
      query = `SELECT * FROM Student_Mess WHERE Mess="${mess.Mess}";`
      var student_details = await executeAsyncQuery(query)
      console.log(student_details,"here")
      student_details = JSON.parse(JSON.stringify(student_details))
      
      for(var i=0; i<student_details.length; i++){
        query = `SELECT Name FROM Student WHERE Roll_No="${student_details[i].Student_Roll_No}";`
        var rollNo = await executeAsyncQuery(query)
        rollNo = JSON.parse(JSON.stringify(rollNo))[0]

        student_details[i].student_name = rollNo.Name
      }
      console.log(student_details,"new" )
      res.render('Mess_due.ejs', { student_details : student_details , messName : mess.Mess, session : req.session });
    } else{
        res.redirect('../login')
    }
});

router.post('/messDues', async function(req, res, next){
  if(req.session.userID){
    var userID = req.session.userID
    var rollNo = req.body.rollNo
    var no_of_days = req.body.day

    var query = `UPDATE Student_Mess SET No_of_days=${no_of_days} WHERE Student_Roll_No="${rollNo}";`
    var a=await executeAsyncQuery(query)

    

    

    res.redirect('/mess/messDues')
    // res.render('Mess_details.ejs', { mess_name: mess.Name , session : req.session });
  } else{
      res.redirect('../login')
  }
})

router.get('/messDetails', async function(req, res, next) {
    if(req.session.userID){
      userID = req.session.userID;

      var query = `SELECT Mess FROM Mess_Incharge WHERE Username="${userID}";`
      var mess = await executeAsyncQuery(query)
      mess = JSON.parse(JSON.stringify(mess))[0]
      console.log(mess)
      res.render('Mess_details.ejs', { mess_name : mess.Name, messName : mess.Mess,session : req.session });
    } else{
        res.redirect('../login')
    }
});

router.post('/messDetails', async function(req, res, next) {
  if(req.session.userID){
    var userID = req.session.userID;
    var mess_charge = req.body.charge;
    var mess_capacity = req.body.capacity;

    var query = `SELECT Mess FROM Mess_Incharge WHERE Username="${userID}";`
    var mess = await executeAsyncQuery(query)
    mess = JSON.parse(JSON.stringify(mess))[0]
    console.log(mess)

    query = `UPDATE Mess SET Total_Capacity=${mess_capacity} WHERE Name="${mess.Mess}";`
    var messCapacity = await executeAsyncQuery(query)

    query = `UPDATE Mess SET Per_day_cost=${mess_charge} WHERE Name="${mess.Mess}";`
    var messCharge = await executeAsyncQuery(query)

    res.redirect('/mess')
    // res.render('Mess_details.ejs', { mess_name: mess.Name , session : req.session });
  } else{
      res.redirect('../login')
  }
});

module.exports = router;
