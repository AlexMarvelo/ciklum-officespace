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
      <search></search>
      <div class="container text-center">Home</div>
    `,
  });
