'use strict';

const utils = require('./../utils');

module.exports = (router) => {


  //
  // seats interface
  //


  router.all('/seat/:seatID/:action', (req, res) => {
    switch (req.params.action) {

    case 'get':
      utils.getSeat(req, res, req.params.seatID);
      break;

    case 'add':
      utils.addSeat(req, res, req.body.seat);
      break;

    case 'update':
      utils.updateSeat(req, res, req.params.seatID, req.body.seat);
      break;

    case 'acttachemployee':
      utils.attachEmployee(req, res, req.params.seatID, req.body.employeeID);
      break;

    case 'getbyfloor':
      utils.getByFloor(req, res, req.query.floorID);
      break;

    default:
      res.redirect('/');
      throw new Error('Wrong request path');
    }
  });

};
