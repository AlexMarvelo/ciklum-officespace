'use strict';

const colors = require('../../config/colors.json');

angular.
  module('modal').
  component('modal', {
    controller: ['$scope', '$stateParams', '$timeout', 'Floor',
      function ModalCtrl($scope, $stateParams, $timeout, Floor) {
        const floorID = $stateParams.floorID;


        this.$onInit = () => {
          const modal = window.jQuery('#modal');
          $timeout(() => {
            modal.iziModal({
              headerColor: colors.themeColor,
              attached: 'top',
              width: 300,
              padding: 20,
              zindex: 1010,
              history: false,
              title: 'Update seat',
              subtitle: 'Fields with *anchor must be unique',
              onClosing: () => {
                Floor(floorID).setActiveSeatID(undefined);
                this.mapcanvas.deactivateAllSeats();
              }
            });
          }, 0);

          $scope.$watch(
            Floor(floorID).getActiveSeat,
            seat => {
              if (seat) modal.iziModal('open');
            }
          );
        };


        this.submitModal = (event) => {
          event.preventDefault();
          console.log('asdasd');
        };
      }
    ],

    bindings: {
      mapcanvas: '<',
    },

    template: `
      <div class="modal-container">
        <div id="modal" role="dialog">
          <form action="#" ng-submit="$ctrl.submitModal($event)">
            <div class="form-group">
              <input name="title" type="text" class="form-control" placeholder="Seat title" tabindex="10">
            </div>
            <div class="form-group">
              <input name="id" type="text" class="form-control" placeholder="*Seat ID" tabindex="11">
            </div>
            <div class="form-group">
              <input name="userID" type="text" class="form-control" placeholder="Employee" tabindex="12">
            </div>
            <div class="form-group text-center">
              <button type="submit" class="btn btn-default" tabindex="13">Save</button>
            </div>
          </form>
        </div>
      </div>
    `,
  });
