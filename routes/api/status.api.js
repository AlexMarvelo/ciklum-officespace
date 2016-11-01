'use strict';

const dbConnection = require('../../db/db')().getDBconnection();

module.exports = (router) => {


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
};
