'use strict';

angular.
  module('homepage').
  component('homepage', {
    controller: ['$scope', 'Floor',
      function HomepageCtrl($scope, Floor) {
        $scope.$watch(
          Floor().returnAllConfigs,
          floors => {
            this.floors = floors
              .map(floor => {
                floor.title = floor.title || floor.id;
                return floor;
              })
              .sort((a, b) => {
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;
                return 0;
              });
          }
        );
      }
    ],

    template: `
      <div class="container homepage">
        <div class="row">
          <div class="col-sm-3 col-sm-push-9">
            <p ng-if="!$ctrl.floors" class="text-center">Loading data...</p>
            <div ng-if="!$ctrl.floors.length">
              <a ui-sref="admin" class="btn btn-default" style="width:100%">Create floors</a>
            </div>
            <div ng-if="$ctrl.floors.length" class="list-group">
              <a ng-repeat="floor in $ctrl.floors" ui-sref="floor({floorID: floor.id})" class="list-group-item">{{floor.title}}</a>
            </div>
          </div>

          <div class="col-sm-9 col-sm-pull-3">
            <div class="jumbotron">
              <h1 class="text-left">Welcome to<br>Ciklum OfficeSpace</h1>
              <p>Now you can find your Ciklum friend much faster</p>
            </div>
          </div>
        </div>
      </div>
    `,
  });
