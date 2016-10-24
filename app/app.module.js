'use strict';

require('../node_modules/angular/angular');

// Import styles
require('../node_modules/bootstrap/dist/css/bootstrap.css');
require('./theme/css/custom-styles.css');

window.jQuery = require('jquery');
require('../node_modules/bootstrap/dist/js/bootstrap.js');

// Import modules
require('./core/core.module');
require('./components/navbar/navbar.module');
require('./components/notifier/notifier.module');
require('./components/entry-form/entry-form.module');
require('./components/homepage/homepage.module');

// Declare app level module which depends on views, and components
angular.module('CiklumSpace', [
  require('angular-ui-router'),
  require('angular-local-storage'),
  require('angular-animate'),
  'core',
  'navbar',
  'notifier',
  'entryForm',
  'homepage'
]);

require('./app.config');

angular.bootstrap(document, ['CiklumSpace']);
