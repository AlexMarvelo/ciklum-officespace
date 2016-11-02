'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore  = require('connect-mongo')(session);
const dbConfig = require('./db/db.config.json');
const flash = require('connect-flash');

const app = express();
app.set('env', 'development');

require('./db/db')(app);

require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// required for passport session
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true,
  // using store session on MongoDB using express-session + connect
  store: new MongoStore({
    url: app.get('env') == 'production' ? dbConfig.url_remote : dbConfig.url_local,
    collection: 'sessions'
  }),
  cookie: { secure: false }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
require('./routes/routes')(app, passport);

// error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (!err) return;
  console.error(err);
});

module.exports = app;
