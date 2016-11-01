'use strict';

const utils = {};
const Employee = require('../models/employee');
const Floor = require('../models/floor');
const notificationCodes = require('../app/config/notifications.json');


utils.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(`- private route requested. access allowed. user: ${req.user.local.email}`);
    return next();
  }
  console.log('- private aren\'t available for unauthorized users. access denied');
  res.redirect('/login');
};


utils.isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('- login/signup route requested. access allowed');
    return next();
  }
  console.log('- login/signup aren\'t available for authorized users. access denied');
  res.redirect('/');
};


utils.renderApp = (res) => {
  let props = {
    pageTitle: 'Ciklum OfficeSpace'
  };
  res.render('index', props);
};


utils.sendEmployees = (req, res) => {
  Employee.find({}).exec()
    .then(employees => res.send({status: notificationCodes.success, employees}))
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};




// ----------------------
// floor config interface
// ----------------------


utils.getFloorConfig = (req, res, floorID) => {
  if (!floorID) {
    res.send({ status: notificationCodes.floorIDRequired });
    return;
  }
  Floor.find({id: floorID}).exec()
    .then(floors => {
      res.send({ status: notificationCodes.success, config: floors[0] });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.setFloorConfig = (req, res, floorID, config) => {
  const setFloorConfig = () => {
    Floor.find({id: floorID}).exec()
      .then(floors => {
        if (floors.length == 0) {
          let floor = new Floor(config);
          floor.save()
            .then(() => {
              res.send({ status: notificationCodes.success });
            })
            .catch(error => {
              error.status = notificationCodes.serverError;
              res.send(error);
              throw error;
            });
          return;
        }
        let floor = floors[0];
        floor.update(config)
          .then(() => {
            res.send({ status: notificationCodes.success });
          })
          .catch(error => {
            error.status = notificationCodes.serverError;
            res.send(error);
            throw error;
          });
      })
      .catch(error => {
        error.status = notificationCodes.serverError;
        res.send(error);
        throw error;
      });
  };

  if (!floorID) {
    res.send({ status: notificationCodes.floorIDRequired });
    return;
  }
  if (!config.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Floor.find({$and: [ {id: config.id}, {id: {$ne: floorID}} ]})
    .then(doubleFloors => {
      if (doubleFloors.length) {
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      setFloorConfig();
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.getAllFloorConfigs = (req, res) => {
  Floor.find().exec()
    .then(floors => res.send({ status: notificationCodes.success, configs: floors}))
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.removeFloor = (req, res, floorID) => {
  if (!floorID) {
    res.send({ status: notificationCodes.floorIDRequired });
    return;
  }
  // TODO remove seats on floor firstly
  Floor.remove({id: floorID}).exec()
    .then(() => {
      res.send({ status: notificationCodes.success });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


module.exports = utils;
