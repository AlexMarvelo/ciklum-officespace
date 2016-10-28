'use strict';

const dbConnection = require('../db/db')().getDBconnection();
const utils = require('./utils');

module.exports = (router, passport) => {


  //
  // aplication status interface
  //

  router.all('/status/:action', (req, res) => {
    switch (req.params.action) {

    case 'dbconnection':
      res.send({dbconnected: dbConnection.readyState});
      break;

    default:
      res.redirect('/');
      throw new Error('Wrong request path');
    }
  });


  //
  // user model interface
  //

  router.post('/user/login', utils.isLoggedOut,
    passport.authenticate('local-login', {
      failureFlash : true
    }),
    (req, res) => {
      res.send(req.user);
    }
  );

  router.post('/user/signup', utils.isLoggedOut,
    passport.authenticate('local-signup', {
      failureFlash : true
    }),
    (req, res) => {
      res.send(req.user);
    }
  );

  router.all('/user/:action', utils.isLoggedIn,
    (req, res) => {
      switch (req.params.action) {

      case 'get':
        res.send(req.user);
        break;

      case 'logout':
        req.logout();
        res.redirect('/login');
        break;

      default:
        res.redirect('/');
        throw new Error('Wrong request path');
      }
    }
  );


  //
  // employees interface
  //

  router.all('/employees/:action', (req, res) => {
    switch (req.params.action) {

    case 'get':
      utils.sendEmployees(req, res);
      break;

    default:
      res.redirect('/');
      throw new Error('Wrong request path');
    }
  });
};
