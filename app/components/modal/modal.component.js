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
          autoOpen: true,
          onClosing: () => {
            $scope.$apply(() => {
              Floor(floorID).setActiveSeatID(undefined);
            });
            this.mapcanvas.deactivateAllSeats();
          },
          onClosed: () => {
            this.modal.iziModal('destroy');
          },
        };


        $scope.$watch(
          User.authorized,
          isAuthorized => {
            this.authorized = isAuthorized;
          }
        );

        $scope.$watch(
          Floor(floorID).getActiveSeat,
          seat => {
            this.seat = seat;
          }
        );

        $scope.$watch(
          () => this.authorized != undefined && this.seat != undefined,
          (ready) => {
            if (!ready) return;
            this.initSeatModal();
          }
        );

        $rootScope.$on('$stateChangeStart',
          (event, toState, toParams, fromState) => {
            if (toState.name == fromState.name) return;
            if (this.modal) this.modal.iziModal('destroy');
          }
        );


        this.$onInit = () => {
          this.modal = window.jQuery('#modal');
        };


        this.initSeatModal = () => {
          if (this.authorized) {
            this.initSeatEditModal();
          } else {
            this.initSeatDetailsModal();
          }
        };


        this.initSeatDetailsModal = () => {
          let getTemplate = () => `
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
          `;
          this.modal.html(getTemplate());
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
          let getTemplate = () => `
            <form class="modal-form form-horizontal" autocomplete="off">
              <div class="form-group">
                <label for="inputSeat1" class="col-xs-4 control-label col-thinpad-right">Title</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="title" class="form-control modal-form-control" value="${this.seat.title ? this.seat.title : ''}" placeholder="Seat title" tabindex="21" id="inputSeat1">
                </div>
              </div>
              <div class="form-group">
                <label for="inputSeat2" class="col-xs-4 control-label col-thinpad-right">*Seat ID</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="seatID" class="form-control modal-form-control" value="${this.seat.id}" placeholder="Unique seat ID" tabindex="22" id="inputSeat2">
                </div>
              </div>
              <div class="form-group">
                <label for="inputSeat3" class="col-xs-4 control-label col-thinpad-right">Occupant</label>
                <div class="col-xs-8 col-thinpad-left">
                  <input type="userID" class="form-control modal-form-control" value="${this.seat.userID ? this.seat.userID : ''}" placeholder="First and last name" tabindex="23" id="inputSeat3">
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
            `;
          this.modal.html(getTemplate());
          let init = () => {
            let wrapper = this.modal.find('.iziModal-content');
            let form = wrapper.find('.modal-form');
            let deleteBtn = wrapper.find('#modal-delete-btn');

            form.one('submit', event => {
              event.preventDefault();
              this.updateSeat();
            });

            deleteBtn.one('click', event => {
              event.preventDefault();
              this.removeSeat();
            });
          };
          let seatEditModal = Object.assign(modalFrame, {
            title: 'Update seat',
            subtitle: 'Fields with *asterisk must be unique',
            onOpening: init,
          });
          $timeout(() => {
            this.modal.iziModal(seatEditModal);
          }, 0);
        };


        this.removeSeat = () => {
          this.mapcanvas.removeSeat(this.seat);
          $scope.$apply(() => {
            Floor(floorID).removeSeat(this.seat);
          });
          this.seat = undefined;
          this.modal.iziModal('close');
        };


        this.updateSeat = () => {
          console.log('submit modal');
          this.seat = undefined;
          this.modal.iziModal('close');
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
