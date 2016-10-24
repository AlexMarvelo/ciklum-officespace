'use strict';

angular.
  module('mapcanvas').
  component('mapcanvas', {
    controller: ['$log', 'Notifications',
      function MapCanvasCtrl($log, Notifications) {
        this.$onInit = () => {
          if (!SVG.supported) {
            Notifications.add(Notifications.codes.svgNotSupported);
            $log.error('SVG not supported');
            return;
          }
          // const container = document.getElementById('mapcanvas-container');
          const img = document.getElementById('mapcanvas-map');
          img.addEventListener('load', () => {
            const draw = SVG('mapcanvas').size(img.width, img.height);
            const rect = draw.rect(100, 100).attr({ fill: '#f06' });
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
