'use strict';

const express = require('express');
const router = express.Router();
const utils = require('./utils');

module.exports = function(app, passport) {

  // pages:
  router.get('/', (req, res) => {
    utils.renderApp(res, app.get('env'));
  });

  router.get('/floor/:floorID', (req, res) => {
    utils.renderApp(res, app.get('env'));
  });

  router.get('/admin', utils.isLoggedIn, (req, res) => {
    utils.renderApp(res, app.get('env'));
  });

  router.get('/login', utils.isLoggedOut, (req, res) => {
    utils.renderApp(res, app.get('env'));
  });

  router.get('/signup', utils.isLoggedOut, (req, res) => {
    utils.renderApp(res, app.get('env'));
  });

  // servises:
  require('./api/api.js')(router, passport);

  app.use(router);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    res.redirect('/');
    next(err);
  });
};
