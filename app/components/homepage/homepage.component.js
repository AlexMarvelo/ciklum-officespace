'use strict';

angular.
  module('homepage').
  component('homepage', {
    controller: ['Floor',
      function HomepageCtrl(Floor) {
        this.floors = Floor().getAllConfigs()
          .map(config => {
            config.title = config.title || config.id;
            return config;
          })
          .sort((a, b) => {
            if (a.title < b.title) return -1;
            if (a.title > b.title) return 1;
            return 0;
          });

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
