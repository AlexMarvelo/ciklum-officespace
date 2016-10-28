'use strict';

angular.
  module('homepage').
  component('homepage', {
    controller: [
      function HomepageCtrl() {
        this.floors = [{
          title: 'Floor #19',
          id: 'floor19',
        }];
        this.$onInit = () => {};
      }
    ],

    template: `
      <div class="container homepage">
        <div class="row">
          <div class="col-sm-3 col-sm-push-9">
            <div class="list-group">
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
