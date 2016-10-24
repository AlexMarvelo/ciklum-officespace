'use strict';

// Define the `core` module
angular.module('core', [
  'core.status',
  'core.user',
  'core.notifications',
  'core.employees'
]);

require('./status/status.module');
require('./user/user.module');
require('./notifications/notifications.module');
require('./employees/employees.module');
