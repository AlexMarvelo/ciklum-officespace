'use strict';

module.exports = (router, passport) => {

  require('./user.api')(router, passport);
  require('./employee.api')(router);
  require('./floor.api')(router);
  require('./seat.api')(router);

};
