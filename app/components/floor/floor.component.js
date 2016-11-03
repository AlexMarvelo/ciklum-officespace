'use strict';

angular.
  module('floor').
  component('floor', {
    controller: ['$scope', '$stateParams', 'Floor',
      function FloorCtrl($scope, $stateParams, Floor) {
        const floorID = $stateParams.floorID;
        $scope.$watch(
          Floor(floorID).returnConfig,
          config => this.config = config,
          true
        );
      }
    ],

    bindings: {
      config: '<',
    },

    template: `
      <search></search>

      <div ng-if="!$ctrl.config" class="contanier">
        <p class="text-center"><br><br><br>Loading data...</p>
      </div>

      <mapcanvas config="$ctrl.config"></mapcanvas>

      <div ng-if="$ctrl.config" class="container">
        <div class="page-header">
          <h1>{{$ctrl.config.title || $ctrl.config.id}}</h1>
        </div>
      </div>
    `,
  });
