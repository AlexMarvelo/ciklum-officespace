'use strict';

const colors = require('../../config/colors.json');

angular.
  module('modal').
  component('modal', {
    controller: ['$scope', '$rootScope', '$stateParams', '$timeout', 'Floor', 'User',
      function ModalCtrl($scope, $rootScope, $stateParams, $timeout, Floor, User) {
        const floorID = $stateParams.floorID;
        const modalFrame = {
          headerColor: colors.themeColor,
          attached: 'top',
          width: 300,
          padding: 15,
          zindex: 1010,
          history: false,
          focusInput: false,
          onClosing: () => {
            Floor(floorID).setActiveSeatID(undefined);
            this.mapcanvas.deactivateAllSeats();
          }
        };


        $scope.$watch(
          User.authorized,
          isAuthorized => {
            this.authorized = isAuthorized;
            this.initSeatModal();
          }
        );

        $rootScope.$on('$stateChangeStart',
          (event, toState, toParams, fromState) => {
            if (toState.name == fromState.name) return;
            this.modal.iziModal('destroy');
          });


        this.$onInit = () => {
          this.modal = window.jQuery('#modal');
          $scope.$watch(
            Floor(floorID).getActiveSeat,
            seat => {
              this.seat = seat;
              if (seat) this.modal.iziModal('open');
            }
          );
        };


        this.initSeatModal = () => {
          if (this.authorized) {
            this.initSeatEditModal();
          } else {
            this.initSeatDetailsModal();
          }
        };


        this.initSeatDetailsModal = () => {
          this.modal.html(`
            <form class="modal-form form-horizontal" autocomplete="off">
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Title</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">Main seat</p>
                </div>
              </div>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Seat ID</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">seat123</p>
                </div>
              </div>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Occupant</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">Alexey Mironenko</p>
                </div>
              </div>
            </form>
          `);
          let init = () => {
            // let wrapper = this.modal.find('.iziModal-content');
          };
          let seatDetailsModal = Object.assign(modalFrame, {
            title: 'Seat details',
            subtitle: 'Only admin can change data here',
            onOpening: init,
          });
          $timeout(() => {
            this.modal.iziModal(seatDetailsModal);
          }, 0);
        };


        this.initSeatEditModal = () => {
          this.modal.html(`
            <form class="modal-form form-horizontal" autocomplete="off">
              <div class="form-group">
                <label for="inputSeat1" class="col-xs-4 control-label col-thinpad-right">Title</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="title" class="form-control modal-form-control" value="Main seat" placeholder="Seat name" tabindex="21" id="inputSeat1">
                </div>
              </div>
              <div class="form-group">
                <label for="inputSeat2" class="col-xs-4 control-label col-thinpad-right">*Seat ID</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="seatID" class="form-control modal-form-control" value="seat123" placeholder="Unique seat ID" tabindex="22" id="inputSeat2">
                </div>
              </div>
              <div class="form-group">
                <label for="inputSeat3" class="col-xs-4 control-label col-thinpad-right">Occupant</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="userID" class="form-control modal-form-control" value="Alexey Mironenko" placeholder="First and last name" tabindex="23" id="inputSeat3">
                </div>
              </div>
              <div class="form-group">
                <div class="col-xs-6 col-thinpad-right">
                  <button type="button" id="modal-delete-btn" class="btn btn-danger modal-btn-control" tabindex="25">Delete</button>
                </div>
                <div class="col-xs-6 col-thinpad-left">
                  <button type="submit" class="btn btn-default modal-btn-control" tabindex="24">Save</button>
                </div>
              </div>
            </form>
            `);
          let init = () => {
            let wrapper = this.modal.find('.iziModal-content');
            let form = wrapper.find('.modal-form');
            let deleteBtn = wrapper.find('#modal-delete-btn');
            form.submit(event => {
              event.preventDefault();
              console.log('submit modal');
            });
            deleteBtn.click(event => {
              event.preventDefault();
              console.log('delete modal');
            });
          };
          let seatEditModal = Object.assign(modalFrame, {
            title: 'Update seat',
            subtitle: 'Fields with *anchor must be unique',
            onOpening: init,
          });
          $timeout(() => {
            this.modal.iziModal(seatEditModal);
          }, 0);
        };


      }
    ],

    bindings: {
      mapcanvas: '<',
    },

    template: `
      <div class="modal-container">
        <div id="modal" class="modal">
        </div>
      </div>
    `,
  });
