'use strict';

require('../search/search.module');
require('../mapcanvas/mapcanvas.module');

angular.module('homepage', [
  'search',
  'mapcanvas'
]);

require('./homepage.component');
