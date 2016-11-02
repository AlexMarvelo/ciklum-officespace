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

      <div ng-if="!$ctrl.config" class="contanier">
        <p class="text-center"><br><br><br>Loading data...</p>
      </div>

      <mapcanvas></mapcanvas>

      <div ng-if="$ctrl.config" class="container">
        <div class="page-header">
          <h1>{{$ctrl.config.title || $ctrl.config.id}}</h1>
        </div>
      </div>
    `,
  });
