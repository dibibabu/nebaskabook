var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')
var db=require('./config/connection');
const session=require('express-session')
const nocache = require('nocache')
let handlebars = require('handlebars')

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({
  helpers:{
    inc:(value)=>{
    return parseInt(value)+1;
    }
      },extname:'hbs',defaultLayout:'main-layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
      handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
        var operators = {
          'eq': function (l, r) { return l == r; },
          'noteq': function (l, r) { return l != r; },
          'gt': function (l, r) { return Number(l) > Number(r); },
          'or': function (l, r) { return l || r; },
          'and': function (l, r) { return l && r; },
          '%': function (l, r) { return (l % r) === 0; }
        }
          , result = operators[operator](operand_1, operand_2);
      
        if (result) return options.fn(this);
        else return options.inverse(this);
      });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache())

app.use(session({secret:"key",resave:true,saveUninitialized:true,coookie:{maxAge:6000000}}))
db.connect((err)=>{
if (err)console.log("connection error");
else console.log('database connected');
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  let user=req.session.user
  res.render('error')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error-two');
});

module.exports = app;
