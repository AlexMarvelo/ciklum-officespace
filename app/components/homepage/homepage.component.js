'use strict';

angular.
  module('homepage').
  component('homepage', {
    controller: [
      function HomepageCtrl() {
        this.$onInit = () => {};

      }
    ],

    template: `
      <div>
        <div class="container text-center">Home</div>
      </div>
    `,
  });
