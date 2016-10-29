'use strict';

const confirm = require('../confirm/confirm.core');

angular.
  module('admin').
  component('admin', {
    controller: ['$scope', 'Floor',
      function AdminCtrl($scope, Floor) {
        this.$onInit = () => {
          this.getFloors();
        };


        this.getFloors = () => {
          this.floors = Floor().getAllConfigs().map(floor => {
            floor.oldID = floor.id;
            return floor;
          });
        };


        this.onFloorSaveClick = (event, floor) => {
          event.preventDefault();
          confirm({
            msg: `Are you sure to update ${floor.oldID} floor config?`,
          })
          .then(() => {
            Floor(floor.oldID).setConfig(floor);
            $scope.$apply(() => {
              this.getFloors();
            });
          }, () => {});
        };


        this.onFloorCreateClick = (event) => {
          event.preventDefault();
          const now = (new Date()).toISOString();
          this.floors.push({id: now, oldID: now, saved: false});
        };


        this.onFloorRemoveClick = (event, floor) => {
          event.preventDefault();
          confirm({
            msg: `Are you sure to delete ${floor.oldID} floor?`,
          })
          .then(() => {
            Floor(floor.oldID).removeFloor();
            $scope.$apply(() => {
              this.getFloors();
            });
          }, () => {});
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
                      <input type="text" ng-model="floor.id" class="form-control" placeholder="no id">
                    </div>
                  </th>
                  <td>
                    <div class="form-group">
                      <input type="text" ng-model="floor.title" class="form-control" placeholder="no title">
                    </div>
                  </th>
                  <td>
                    <div class="form-group">
                      <input type="text" ng-model="floor.mapSrc" class="form-control" placeholder="no map">
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
                        <button ng-if="floor.saved != false" type="button" ng-click="$ctrl.onFloorRemoveClick($event, floor)" class="btn btn-danger">Remove</button>
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
