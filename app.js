var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var loginRouter=require('./routes/login')
var database = require('./sqlConnection');
var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
var messRouter = require('./routes/mess');
var hostelRouter = require('./routes/hostel');
const bcrypt = require('bcrypt')
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')

var app = express();
console.log("start");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: 'webproject',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/contact', indexRouter);
app.use('/about', indexRouter);
app.use('/student', studentRouter);
app.use('/mess',messRouter);
app.use('/hostel',hostelRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.send(err);
});

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

// function todayDate(){
//   var today = new Date();
//   today.setDate(today.getDate());
//   var todays_date = today.toString().split("00:00:00 GMT+0530 (India Standard Time)")[0];

//   return todays_date;
// }

// async function isEndDate(){
//   var todays_date = todayDate();
//   var query = `SELECT End FROM Start_End_Date;`;
//   var date = await executeAsyncQuery(query)
//   date = JSON.parse(JSON.stringify(date))[0]

//   if( date.Start == null || date.Start != todays_date){
//     return false
//   } else {
//     return true
//   }
// }

// async function isStartDate(){
//   var todays_date = todayDate();
//   var query = `SELECT Start FROM Start_End_Date;`;
//   var date = await executeAsyncQuery(query)
//   date = JSON.parse(JSON.stringify(date))[0]

//   if( date.Start == null || date.Start != todays_date){
//     return false
//   } else {
//     return true
//   }
// }


async function isStartDate(){
var query =  `Select * FROM  Start_End_Date ;`
var student_access= await executeAsyncQuery(query)
student_access = JSON.parse(JSON.stringify(student_access))
var now = new Date()
var start =new Date(student_access[0].Start)
if(now==start)
{
  console.log("nnnn")
   if(true){
    
  
    var query = `SELECT Roll_No FROM Student;`
    var roll_numbers=await executeAsyncQuery(query)
    roll_numbers = JSON.parse(JSON.stringify(roll_numbers))
  
    for(var i=0; i<roll_numbers.length; i++){
      try{  
      query = `SELECT Mess, No_of_days FROM Student_Mess WHERE Student_Roll_No="${roll_numbers[i].Roll_No}";`
      var rollNo = await executeAsyncQuery(query)
      rollNo = JSON.parse(JSON.stringify(rollNo))[0]
      console.log(roll_numbers[i].Roll_No)
      query = `SELECT Per_day_cost FROM Mess WHERE Hostel="${rollNo.Mess}";`
      var per_day_cost_mess = await executeAsyncQuery(query)
      per_day_cost_mess = JSON.parse(JSON.stringify(per_day_cost_mess))[0]
      var mess_dues = Number(rollNo.No_of_days)*Number(per_day_cost_mess.Per_day_cost)
      query = `UPDATE Student_Dues SET Dues=Dues+${mess_dues} WHERE Student_Roll_No="${roll_numbers[i].Roll_No}";`
      var a=await executeAsyncQuery(query)}
      catch(error){

      }
    }
  
  
    query = `SELECT Name FROM Hostel;`
    var hostel = await executeAsyncQuery(query)
    hostel = JSON.parse(JSON.stringify(hostel))
  
    for(var i=0; i<hostel.length; i++){
      var query = `SELECT No_of_days FROM Student_Hostel WHERE Hostel="${hostel[i].Name}";`
      var no_of_days = await executeAsyncQuery(query)
      no_of_days = JSON.parse(JSON.stringify(no_of_days))[0]
      try{
      var query = `SELECT Per_day_cost FROM Hostel WHERE Name="${hostel[i].Name}";`
      var per_day_cost_hostel = await executeAsyncQuery(query)
      per_day_cost_hostel = JSON.parse(JSON.stringify(per_day_cost_hostel))[0]
      console.log(no_of_days.No_of_days)
      var hostel_dues = Number(no_of_days.No_of_days)*Number(per_day_cost_hostel.Per_day_cost);
      query = `UPDATE Student_Dues sd SET Dues=Dues+${hostel_dues} WHERE EXISTS (SELECT Student_Roll_No, Hostel FROM Student_Hostel sh WHERE sd.Student_Roll_No = sh.Student_Roll_No AND sh.Hostel ="${hostel[i].Name}");`
      a = await executeAsyncQuery(query)
    }
    catch(error){

    }
    }
    query= `DELETE FROM  Student_Mess;`
  var student_delete= await executeAsyncQuery(query)
 
  }
}
}
isStartDate()

module.exports = app;
