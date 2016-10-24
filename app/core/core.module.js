'use strict';

// Define the `core` module
angular.module('core', [
  'core.movies',
  'core.movie',
  'core.comments',
  'core.status',
  'core.user',
  'core.notifications'
]);

require('./notifications/notifications.module');
require('./movies/movies.module');
require('./movie/movie.module');
require('./comments/comments.module');
require('./status/status.module');
require('./user/user.module');
