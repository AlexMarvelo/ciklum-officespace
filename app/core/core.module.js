'use strict';

angular.module('core', [
  'core.user',
  'core.notifications',
  'core.employees',
  'core.floor'
]);

require('./user/user.module');
require('./notifications/notifications.module');
require('./employees/employees.module');
require('./floor/floor.module');
