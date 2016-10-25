'use strict';

require('../search/search.module');
require('../mapcanvas/mapcanvas.module');

angular.module('floor', [
  'search',
  'mapcanvas'
]);

require('./floor.component');
