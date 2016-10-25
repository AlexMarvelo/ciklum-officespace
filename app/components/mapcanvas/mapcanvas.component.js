'use strict';

const Mapcanvas = require('./mapcanvas.core');

angular.
  module('mapcanvas').
  component('mapcanvas', {
    controller: ['$scope', '$log', 'Notifications', 'User', 'Floor',
      function MapCanvasCtrl($scope, $log, Notifications, User, Floor) {
        const floorID = 'floor19';
        // Floor(floorID).cleanSeats();

        const mapcanvas = new Mapcanvas($scope, $log, floorID, {
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
            mapcanvas.drawMapCanvas('mapcanvas', img.width, img.height);
            mapcanvas.setSeats(Floor(floorID).getSeats());
          });
        };


      }
    ],

    template: `
      <div class="container">
        <div class="row">
          <div class="col-lg-10 col-lg-push-1">
            <div class="mapcanvas-container" id="mapcanvas-container">
              <img ng-src="images/floor19.png" class="mapcanvas-map" id="mapcanvas-map">
              <div class="mapcanvas" id="mapcanvas"></div>
            </div>
          </div>
        </div>
      </div>
    `,
  });
