'use strict';

const utils = require('./../utils');

module.exports = (router) => {


  //
  // employees interface
  //

  router.all('/employee/:action', (req, res) => {
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
