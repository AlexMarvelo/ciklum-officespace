'use strict';

const utils = require('./../utils');

module.exports = (router) => {


  //
  // floors interface
  //

  router.all('/floor/:floorID/:action', (req, res) => {
    switch (req.params.action) {

    case 'getconfig':
      utils.getFloorConfig(req, res, req.params.floorID);
      break;

    case 'addconfig':
      utils.addFloorConfig(req, res, req.body.config);
      break;

    case 'updateconfig':
      utils.updateFloorConfig(req, res, req.params.floorID, req.body.config);
      break;

    case 'getallconfigs':
      utils.getAllFloorConfigs(req, res);
      break;

    case 'remove':
      utils.removeFloor(req, res, req.params.floorID);
      break;

    default:
      res.redirect('/');
      throw new Error('Wrong request path');
    }
  });

};
