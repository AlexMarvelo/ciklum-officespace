'use strict';

require('../search/search.module');
require('../mapcanvas/mapcanvas.module');
require('../modal/modal.module');

angular.module('floor', [
  'search',
  'mapcanvas',
  'modal'
]);

require('./floor.component');
