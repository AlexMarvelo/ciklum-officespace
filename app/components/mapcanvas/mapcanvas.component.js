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


        Floor(floorID).getSeats()
          .then(seats => {
            $scope.$apply(() => {
              this.seats = seats;
            });
          }, () => {});


        $scope.$watch(
          () => this.config && this.seats,
          ready => {
            if (!ready) return;
            if (!SVG.supported) {
              Notifications.add(Notifications.codes.svgNotSupported);
              $log.error('SVG not supported');
              return;
            }
            const img = document.getElementById('mapcanvas-map');
            if (img.complete) {
              this.initMapcanvas(img);
            } else {
              img.addEventListener('load', () => {
                $scope.$apply(() => {
                  this.initMapcanvas(img);
                });
              });
            }
          }
        );


        this.initMapcanvas = (img) => {
          this.mapcanvas.drawMapCanvas('mapcanvas', img.width, img.height);
          this.mapcanvas.ready = true;
          this.mapcanvas.setSeats(this.seats);
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
          <div class="col-lg-10 col-lg-push-1">
            <div class="mapcanvas-container" id="mapcanvas-container" style="width: {{$ctrl.config.mapWidth ? $ctrl.config.mapWidth + 'px' : '100%'}}">
              <img ng-src="{{$ctrl.config.mapSource}}" class="mapcanvas-map" id="mapcanvas-map" alt="Map loading failed">
              <div class="mapcanvas" id="mapcanvas"></div>
            </div>
          </div>
        </div>
      </div>
    `,
    //<modal mapcanvas="$ctrl.mapcanvas"></modal>
  });
