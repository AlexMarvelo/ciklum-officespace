'use strict';

angular.
  module('floor').
  component('floor', {
    controller: ['$scope', '$stateParams', 'Floor',
      function FloorCtrl($scope, $stateParams, Floor) {
        const floorID = $stateParams.floorID;
        this.$onInit = () => {
          this.config = Floor(floorID).getConfig();
        };
      }
    ],

    template: `
      <search></search>
      <mapcanvas></mapcanvas>

      <div class="container">
        <div class="page-header">
          <h1>{{$ctrl.config.title || $ctrl.config.id}}</h1>
        </div>
      </div>
    `,
  });
