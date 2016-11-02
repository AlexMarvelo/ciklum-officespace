'use strict';

angular.
  module('floor').
  component('floor', {
    controller: ['$scope', '$stateParams', 'Floor',
      function FloorCtrl($scope, $stateParams, Floor) {
        const floorID = $stateParams.floorID;
        this.$onInit = () => {
          Floor(floorID).getConfig()
            .then(config => {
              $scope.$apply(() => {
                this.config = config;
              });
            }, () => {});
        };
      }
    ],



    template: `
      <search></search>
      <mapcanvas></mapcanvas>

      <div class="container">
        <p ng-if="!$ctrl.config" class="text-center"><br><br><br>Loading data...</p>
        <div ng-if="$ctrl.config">
          <div class="page-header">
            <h1>{{$ctrl.config.title || $ctrl.config.id}}</h1>
          </div>
        </div>
      </div>
    `,
  });
