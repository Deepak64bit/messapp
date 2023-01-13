if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config');
const app = require('../app');
initializePassport(
    passport, 
    userID => users.find(user => user.userID === userID),
    id => users.find(user => user.id === id)
)

const users=[]

// app.use(express.urlencoded({ extended: false }))
// app.use(flash())
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
// app.use(passport.initialize())
// app.use(passport.session())

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login.ejs');
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}))

module.exports = router;
