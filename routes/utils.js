'use strict';

const utils = {};
const Employee = require('../models/employee');
const Floor = require('../models/floor');
const Seat = require('../models/seat');
const notificationCodes = require('../share/config/notifications.json');




utils.renderApp = (res) => {
  let props = {
    pageTitle: 'Ciklum OfficeSpace'
  };
  res.render('index', props);
};




// ----------------------
// user interface
// ----------------------


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




// ----------------------
// employees interface
// ----------------------


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


utils.setFloorConfig = (req, res, floorID, config = {}) => {
  const setFloorConfig = () => {
    Floor.find({id: floorID}).exec()
      .then(floors => {
        if (floors.length == 0) {
          const floor = new Floor(config);
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
    .then(floors => {
      if (floors.length) {
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




// ---------------
// seats interface
// ---------------


utils.getSeat = (req, res, seatID) => {
  if (!seatID) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.find({id: seatID}).exec()
    .then(seats => {
      res.send({ status: notificationCodes.success, seat: seats[0]});
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.addSeat = (req, res, seat = {}) => {
  const addSeat = () => {
    const seatInst = new Seat(seat);
    seatInst.save()
      .then(() => {
        res.send({ status: notificationCodes.success });
      })
      .catch(error => {
        error.status = notificationCodes.serverError;
        res.send(error);
        throw error;
      });
  };

  if (!seat.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.find({id: seat.id}).exec()
    .then(seats => {
      if (seats.length) {
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      addSeat();
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.updateSeat = (req, res, seatID, seat) => {
  const updateSeat = () => {
    Seat.find({id: seatID}).exec()
      .then(seats => {
        const targetSeat = seats[0];
        targetSeat.update(seat)
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

  if (!seatID) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  if (!seat.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.find({$and: [ {id: seat.id}, {id: {$ne: seatID}} ]})
    .then(seats => {
      if (seats.length) {
        console.log(seats);
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      updateSeat();
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.getByFloor = (req, res, floorID) => {
  if (!floorID) {
    res.send({ status: notificationCodes.floorIDRequired });
    return;
  }
  Seat.find({floorID}).exec()
    .then(seats => {
      res.send({ status: 200, seats });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};




module.exports = utils;
