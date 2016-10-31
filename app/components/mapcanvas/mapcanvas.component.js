'use strict';

const Mapcanvas = require('./mapcanvas.core');

angular.
  module('mapcanvas').
  component('mapcanvas', {
    controller: ['$scope', '$log', '$stateParams', '$timeout', 'Notifications', 'User', 'Floor',
      function MapCanvasCtrl($scope, $log, $stateParams, $timeout, Notifications, User, Floor) {
        const floorID = $stateParams.floorID;
        const floorMapConfig = Floor(floorID).getConfig();
        this.mapSrc = floorMapConfig.mapSrc;
        this.mapWidth = floorMapConfig.width;

        this.mapcanvas = new Mapcanvas($scope, $log, floorID, {
          Notifications,
          User,
          Floor,
        });

        this.$onInit = () => {
          if (!SVG.supported) {
            Notifications.add(Notifications.codes.svgNotSupported);
            $log.error('SVG not supported');
            return;
          }
          const img = document.getElementById('mapcanvas-map');
          img.addEventListener('load', () => {
            this.mapcanvas.drawMapCanvas('mapcanvas', img.width, img.height);
            $scope.$apply(() => {
              this.mapcanvas.ready = true;
            });
            this.mapcanvas.setSeats(Floor(floorID).getSeats());
          });
        };
      }
    ],

    bindings: {
      mapcanvas: '<',
    },

    template: `
      <div class="container">
        <div class="row">
          <div class="col-lg-10 col-lg-push-1">
            <div class="mapcanvas-container" id="mapcanvas-container" style="width: {{$ctrl.mapWidth ? $ctrl.mapWidth + 'px' : '100%'}}">
              <img ng-src="{{$ctrl.mapSrc}}" class="mapcanvas-map" id="mapcanvas-map" alt="Map loading failed">
              <div class="mapcanvas" id="mapcanvas"></div>
            </div>
          </div>
        </div>
      </div>

      <modal mapcanvas="$ctrl.mapcanvas"></modal>
    `,
  });
