'use strict';

angular.
  module('floor').
  component('floor', {
    controller: [
      function FloorCtrl() {
        this.$onInit = () => {};
      }
    ],

    template: `
      <search></search>
      <mapcanvas></mapcanvas>
    `,
  });
