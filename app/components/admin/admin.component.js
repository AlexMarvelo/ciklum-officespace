'use strict';

const confirm = require('../confirm/confirm.core');

angular.
  module('admin').
  component('admin', {
    controller: ['$scope', 'Floor', 'Notifications',
      function AdminCtrl($scope, Floor, Notifications) {
        $scope.$watch(
          Floor().returnAllConfigs,
          floors => {
            this.floorsCache = floors.map(floor => Object.assign({}, floor));
            this.floors = floors.map(floor => {
              floor = Object.assign({}, floor);
              floor.oldID = floor.id;
              floor.saved = true;
              return floor;
            });
          },
          true
        );


        this.onFloorSaveClick = (event, floor) => {
          event.preventDefault();
          if (this.floorsCache.find(f => f.id == floor.id && f.id != floor.oldID)) {
            Notifications.add(Notifications.codes.idUnique);
            return;
          }
          const newFloor = this.floorsCache.find(f => f.id == floor.oldID) == undefined;
          confirm({
            msg: `Are you sure to ${newFloor ? 'set' : 'update'} ${floor.oldID} floor config?`,
          })
          .then(() => {
            if (newFloor) {
              this.addConfig(floor);
            } else {
              this.updateConfig(floor);
            }
          }, () => {});
        };

        this.addConfig = (floor) => {
          Floor().addConfig(floor)
            .catch(() => {});
        };

        this.updateConfig = (floor) => {
          Floor(floor.oldID).updateConfig(floor)
            .catch(() => {});
        };


        this.onFloorRemoveClick = (event, floor) => {
          event.preventDefault();
          confirm({
            msg: `Are you sure to delete ${floor.oldID} floor?`,
          })
          .then(() => {
            Floor(floor.oldID).removeFloor()
              .then(() => $scope.$apply())
              .catch(() => {});
          }, () => {});
        };


        this.onFloorCreateClick = (event) => {
          event.preventDefault();
          const now = (new Date()).toISOString();
          this.floors.push({id: now, oldID: now, saved: false});
        };
      }
    ],

    template: `
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="page-header">
              <h1>Setup your floors</h1>
            </div>
            <div ng-if="!$ctrl.floors">
              <p class="text-center">Loading data...</p>
            </div>
            <table ng-if="$ctrl.floors" class="table table-striped admin-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>Title</th>
                  <th>Map source</th>
                  <th>Map width</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>

                <tr ng-repeat="floor in $ctrl.floors">
                  <td>
                    <div class="form-group">
                      <input type="text" ng-model="floor.id" class="form-control" placeholder="id is required">
                    </div>
                  </th>
                  <td>
                    <div class="form-group">
                      <input type="text" ng-model="floor.title" class="form-control" placeholder="untitled">
                    </div>
                  </th>
                  <td>
                    <div class="form-group">
                      <input type="text" ng-model="floor.mapSource" class="form-control" placeholder="no map">
                    </div>
                  </th>
                  <td>
                    <div class="form-group">
                      <input type="number" ng-model="floor.width" min="0" max="2000" class="form-control">
                    </div>
                  </th>
                  <td>
                    <div class="row">
                      <div class="col-xs-6 col-thinpad-right">
                        <button type="button" ng-click="$ctrl.onFloorSaveClick($event, floor)" class="btn btn-primary">Save</button>
                      </div>
                      <div class="col-xs-6 col-thinpad-left">
                        <button ng-if="floor.saved" type="button" ng-click="$ctrl.onFloorRemoveClick($event, floor)" class="btn btn-danger">Remove</button>
                      </div>
                    </div>
                  </th>
                </tr>

                <tr>
                  <td></th>
                  <td></th>
                  <td></th>
                  <td></th>
                  <td>
                    <button type="button" ng-click="$ctrl.onFloorCreateClick($event)" class="btn btn-default">Add</button>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
  });
