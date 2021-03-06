'use strict';

const Mapcanvas = require('./mapcanvas.core');

angular.
  module('mapcanvas').
  component('mapcanvas', {
    controller: ['$scope', '$log', '$stateParams', '$timeout', 'Notifications', 'User', 'Floor', 'Employees', 'CONFIG',
      function MapCanvasCtrl($scope, $log, $stateParams, $timeout, Notifications, User, Floor, Employees, CONFIG) {
        const floorID = $stateParams.floorID;
        this.mapcanvas = new Mapcanvas($scope, $log, floorID, {
          Notifications,
          User,
          Floor,
          Employees,
          CONFIG,
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
              if (CONFIG.consoleErrors) $log.error('SVG not supported');
              return;
            }
            const img = window.jQuery('<img class="mapcanvas-map" id="mapcanvas-map" alt="Map is loading" />');
            img.on('load', () => {
              $scope.$apply(() => {
                this.mapcanvas.drawMapCanvas('mapcanvas', img.width(), img.height());
                this.mapcanvas.ready = true;
                this.mapcanvas.setSeats(this.seats);
                this.initialized = true;
              });
            })
            .attr('src', this.config.mapSource)
            .appendTo(window.jQuery('#mapcanvas-container'));
          }
        );
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
              <div class="mapcanvas" id="mapcanvas"></div>
            </div>
          </div>
        </div>
      </div>
      <modal mapcanvas="$ctrl.mapcanvas" seats="$ctrl.seats"></modal>
    `,
  });
