'use strict';

const colors = require('../../config/colors.json');

angular.
  module('modal').
  component('modal', {
    controller: ['$scope', '$rootScope', '$stateParams', '$timeout', 'Floor', 'Employees', 'User',
      function ModalCtrl($scope, $rootScope, $stateParams, $timeout, Floor, Employees, User) {
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
            this.modal.empty();
          },
        };


        this.$onInit = () => {
          this.modal = window.jQuery('#modal');
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
          () => this.authorized != undefined &&
                this.seat != undefined,
          (ready) => {
            if (!ready) return;
            this.initSeatModal();
          }
        );

        $rootScope.$on('$stateChangeStart',
          (event, toState, toParams, fromState) => {
            if (toState.name == fromState.name) return;
            if (this.modal) {
              this.modal.iziModal('destroy');
              this.modal.empty();
            }
          }
        );


        this.initSeatModal = () => {
          if (this.authorized) {
            this.initSeatEditModal();
          } else {
            this.initSeatDetailsModal();
          }
        };


        this.initSeatDetailsModal = () => {
          const getTemplate = () => {
            const hasEmployee = this.seat.employeeID != undefined;
            const employee = this.getEmployee(this.seat.employeeID);
            return `
              <form class="modal-form form-horizontal" autocomplete="off">
                <div class="form-group">
                  <label class="col-xs-4 control-label col-thinpad-right">Seat title</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <p class="modal-input-value">${this.seat.title ? this.seat.title : '<i>untitled</i>'}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-xs-4 control-label col-thinpad-right">Seat ID</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <p class="modal-input-value">${this.seat.id}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-xs-4 control-label col-thinpad-right">Occupant</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <p class="modal-input-value">${hasEmployee && employee ? employee.firstName + ' ' + employee.lastName : '<i>free</i>'}</p>
                  </div>
                </div>
              </form>
            `;
          };
          this.modal.html(getTemplate());

          const init = () => {};

          const seatDetailsModal = Object.assign(modalFrame, {
            title: 'Seat details',
            subtitle: 'Only admin can change data here',
            onOpening: init,
          });

          $timeout(() => {
            this.modal.iziModal(seatDetailsModal);
          }, 0);
        };


        this.initSeatEditModal = () => {
          const getTemplate = () => {
            const hasEmployee = this.seat.employeeID != undefined;
            const employee = this.getEmployee(this.seat.employeeID);
            return `
              <form class="modal-form form-horizontal" autocomplete="off">
                <div class="form-group">
                  <label for="inputSeat1" class="col-xs-4 control-label col-thinpad-right">Title</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <input
                      type="text"
                      name="title"
                      class="form-control modal-form-control"
                      value="${this.seat.title ? this.seat.title : ''}"
                      placeholder="Seat title"
                      tabindex="21"
                      id="inputSeat1">
                  </div>
                </div>
                <div class="form-group">
                  <label for="inputSeat2" class="col-xs-4 control-label col-thinpad-right">*Seat ID</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <input
                      type="text"
                      name="seatID"
                      class="form-control modal-form-control"
                      value="${this.seat.id}"
                      placeholder="Unique seat ID"
                      tabindex="22"
                      required
                      id="inputSeat2">
                  </div>
                </div>
                <div class="form-group">
                  <label for="inputSeat3" class="col-xs-4 control-label col-thinpad-right">Occupant</label>
                  <div class="col-xs-8 col-thinpad-left">
                    <input
                      type="text"
                      name="userName"
                      class="form-control modal-form-control"
                      value="${hasEmployee && employee ? employee.firstName + ' ' + employee.lastName : ''}"
                      placeholder="First and last name" tabindex="23" id="inputSeat3">
                    <input
                      type="hidden"
                      name="employeeID"
                      value="${hasEmployee ? this.seat.employeeID : ''}"
                      class="hidden">
                    <div class="modal-employee-list-container">
                      <ul class="modal-employee-list"></ul>
                    </div>
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
          };
          this.modal.html(getTemplate());

          const removeSeat = () => {
            this.mapcanvas.removeSeat(this.seat);
            $scope.$apply(() => {
              Floor(floorID).removeSeat(this.seat);
            });
            this.seat = undefined;
            this.modal.iziModal('close');
          };

          const updateSeat = () => {
            let newSeat = Object.assign({}, this.seat);
            newSeat.title = this.modal.find('input[name="title"]').val();
            newSeat.id = this.modal.find('input[name="seatID"]').val();
            newSeat.employeeID = this.modal.find('input[name="employeeID"]').val();

            $scope.$apply(() => {
              Floor(floorID).updateSeat(this.seat.id, newSeat);
            });
            this.mapcanvas.updateSeat(this.seat.id, newSeat);
            this.seat = undefined;
            this.modal.iziModal('close');
          };

          const init = () => {
            const wrapper = this.modal.find('.iziModal-content');
            const form = wrapper.find('.modal-form');
            const deleteBtn = wrapper.find('#modal-delete-btn');

            const employeeNameField = form.find('input[name="userName"]');
            const employeeIDField = form.find('input[name="employeeID"]');
            const employeeList = form.find('.modal-employee-list');

            employeeNameField.keyup(() => {
              let query = employeeNameField.val().toLowerCase();
              let newList = this.employees
                .filter(employee =>
                  employee.firstName.toLowerCase().indexOf(query) != -1 ||
                  employee.lastName.toLowerCase().indexOf(query) != -1 ||
                  (employee.firstName.toLowerCase() + ' ' + employee.lastName.toLowerCase()).indexOf(query) != -1
                )
                .map(employee => `<li data-id="${employee.id}">${employee.firstName} ${employee.lastName}</li>`)
                .sort();
              employeeList.html(newList.length != this.employees.length ? newList.join('') : '');
            });

            employeeList.click(event => {
              let employee = this.getEmployee(event.target.dataset.id);
              employeeNameField.val(`${employee.firstName} ${employee.lastName}`);
              employeeIDField.val(employee.id);
              employeeList.html('');
            });

            form.submit(event => {
              event.preventDefault();
              updateSeat();
            });

            deleteBtn.click(event => {
              event.preventDefault();
              removeSeat();
            });
          };

          const seatEditModal = Object.assign(modalFrame, {
            title: 'Update seat',
            subtitle: 'Fields with *asterisk must be unique',
            onOpening: init,
          });

          $timeout(() => {
            this.modal.iziModal(seatEditModal);
          }, 0);
        };


        this.getEmployee = (employeeID) => {
          return Employees.get().find(employee => employee.id == employeeID);
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
