'use strict';

const utils = {};
const Employee = require('../models/employee');
const Floor = require('../models/floor');
const Seat = require('../models/seat');
const notificationCodes = require('../share/config/notifications.json');




utils.renderApp = (res, env) => {
  let props = {
    pageTitle: 'Ciklum OfficeSpace',
    env,
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


utils.getEmployees = (req, res) => {
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


utils.addFloorConfig = (req, res, floorConfig) => {
  const addFloorConfig = () => {
    const floor = new Floor(floorConfig );
    floor.save()
      .then(() => {
        res.send({ status: notificationCodes.success });
      })
      .catch(error => { throw error; });
  };

  if (!floorConfig.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Floor.find({id: floorConfig.id})
    .then(floors => {
      if (floors.length) {
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      addFloorConfig();
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.updateFloorConfig = (req, res, floorID, floorConfig) => {
  const setFloorConfig = () => {
    Floor.find({id: floorID}).exec()
      .then(floors => {
        if (!floors.length) {
          res.send({ status: notificationCodes.floorNotFound });
          return;
        }
        const floor = floors[0];
        floor.update(floorConfig)
          .then(() => {
            res.send({ status: notificationCodes.success });
          })
          .catch(error => { throw error; });
      })
      .catch(error => { throw error; });
  };

  if (!floorID) {
    res.send({ status: notificationCodes.floorIDRequired });
    return;
  }
  if (!floorConfig || !floorConfig.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Floor.find({$and: [ {id: floorConfig.id}, {id: {$ne: floorID}} ]})
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
  Seat.remove({floorID}).exec()
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
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


const unattachEmployeeFromOthers = (employeeID, exceptSeatID) => {
  return Seat.update(
    { $and: [{employeeID: employeeID}, {id: {$ne: exceptSeatID}}]},
    { $unset: {employeeID: ''}}
  ).exec()
    .catch(error => { throw error; });
};


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


utils.addSeat = (req, res, seat) => {
  const addSeat = () => {
    const seatInst = new Seat(seat);
    seatInst.save()
      .then(() => {
        res.send({ status: notificationCodes.success });
      })
      .catch(error => { throw error; });
  };

  if (!seat || !seat.id) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.find({id: seat.id}).exec()
    .then(seats => {
      if (seats.length) {
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      unattachEmployeeFromOthers(seat.employeeID, seat.id);
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
          .catch(error => { throw error; });
      })
      .catch(error => { throw error; });
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
        res.send({ status: notificationCodes.idUnique });
        return;
      }
      unattachEmployeeFromOthers(seat.employeeID, seatID)
        .then(() => {
          updateSeat();
        })
        .catch(error => { throw error; });
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


utils.attachEmployee = (req, res, seatID, employeeID) => {
  const attachEmployee = () => {
    return Seat.update({id: seatID}, employeeID ? {$set: {employeeID}} : {$unset: {employeeID}} ).exec()
      .catch(error => { throw error; });
  };

  if (!seatID) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  unattachEmployeeFromOthers(employeeID, seatID)
    .then(() => {
      attachEmployee()
        .then(() => {
          res.send({ status: notificationCodes.success });
        })
        .catch(error => { throw error; });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.removeSeat = (req, res, seatID) => {
  if (!seatID) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.remove({id: seatID}).exec()
    .then(() => {
      res.send({ status: notificationCodes.success });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


utils.getSeatByEmployee = (req, res, employeeID) => {
  if (!employeeID) {
    res.send({ status: notificationCodes.idRequired });
    return;
  }
  Seat.find({employeeID}).exec()
    .then(seats => {
      res.send({ status: notificationCodes.success, seat: seats[0] });
    })
    .catch(error => {
      error.status = notificationCodes.serverError;
      res.send(error);
      throw error;
    });
};


module.exports = utils;
