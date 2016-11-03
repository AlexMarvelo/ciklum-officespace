'use strict';

const Mapcanvas = require('./mapcanvas.core');

angular.
  module('mapcanvas').
  component('mapcanvas', {
    controller: ['$scope', '$log', '$stateParams', '$timeout', 'Notifications', 'User', 'Floor', 'Employees',
      function MapCanvasCtrl($scope, $log, $stateParams, $timeout, Notifications, User, Floor, Employees) {
        const floorID = $stateParams.floorID;
        this.mapcanvas = new Mapcanvas($scope, $log, floorID, {
          Notifications,
          User,
          Floor,
          Employees,
        });


        Floor(floorID).loadSeats();


        $scope.$watch(
          Floor(floorID).getSeats,
          seats => this.seats = seats
        );


        $scope.$watch(
          () => this.config && this.seats && !this.initialized,
          ready => {
            if (!ready) return;
            if (!SVG.supported) {
              Notifications.add(Notifications.codes.svgNotSupported);
              $log.error('SVG not supported');
              return;
            }
            const img = document.getElementById('mapcanvas-map');
            img.addEventListener('load', () => {
              $scope.$apply(() => {
                this.initMapcanvas(img);
              });
            });
          }
        );


        this.initMapcanvas = (img) => {
          this.mapcanvas.drawMapCanvas('mapcanvas', img.width, img.height);
          this.mapcanvas.ready = true;
          this.mapcanvas.setSeats(this.seats);
          this.initialized = true;
        };
      }
    ],

    bindings: {
      mapcanvas: '<',
      config: '<',
    },

    template: `
      <div class="container">
        <div class="row">
          <div class="col-lg-10 col-lg-push-1 mapcanvas-frame">
            <div class="mapcanvas-container" id="mapcanvas-container" style="width: {{$ctrl.config.width ? $ctrl.config.width + 'px' : '100%'}}">
              <img ng-src="{{$ctrl.config.mapSource}}" class="mapcanvas-map" id="mapcanvas-map" alt="Map is loading">
              <div class="mapcanvas" id="mapcanvas"></div>
            </div>
          </div>
        </div>
      </div>
      <modal mapcanvas="$ctrl.mapcanvas" seats="$ctrl.seats"></modal>
    `,
  });
