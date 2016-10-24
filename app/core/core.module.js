'use strict';

// Define the `core` module
angular.module('core', [
  'core.status',
  'core.user',
  'core.notifications'
]);

require('./notifications/notifications.module');
require('./status/status.module');
require('./user/user.module');
