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
          Employees.get,
          employees => {
            this.employees = employees;
          }
        );

        $scope.$watch(
          () => this.authorized != undefined &&
                this.seat != undefined &&
                this.employees != undefined,
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
              <span class="modal-notification-msg"></span>
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
          const removeEmployeeIcon = '<span class="glyphicon glyphicon-remove glyphicon-remove--employee" aria-hidden="true"></span>';

          const getTemplate = () => {
            const hasEmployee = this.seat.employeeID != undefined;
            const employee = this.getEmployee(this.seat.employeeID);
            return `
              <form class="modal-form form-horizontal" autocomplete="off" novalidate>
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
                    <div class="modal-form-control-container modal-form-control-container--employee">
                      <input
                        type="text"
                        name="userName"
                        class="form-control modal-form-control modal-form-control--employee"
                        value="${hasEmployee && employee ? employee.firstName + ' ' + employee.lastName : ''}"
                        placeholder="First and last name" tabindex="23" id="inputSeat3">
                      ${hasEmployee && employee ? removeEmployeeIcon : ''}
                    </div>

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
                <div class="form-group modal-form-group--last">
                  <div class="col-xs-6 col-thinpad-right">
                    <button type="button" id="modal-delete-btn" class="btn btn-danger modal-btn-control" tabindex="25">Delete</button>
                  </div>
                  <div class="col-xs-6 col-thinpad-left">
                    <button type="submit" class="btn btn-default modal-btn-control" tabindex="24">Save</button>
                  </div>
                </div>
              </form>
              <span class="modal-notification-msg"></span>
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

          const emptyIDValidation = () => {
            let valid = true;
            this.modal.find('input[required]').each(function() {
              if (!this.value.length) valid = false;
            });
            if (!valid) {
              this.addNotification({
                status: 'ERROR',
                msg: 'Fill all required fields',
                code: 1
              });
            }
            return valid;
          };

          const uniqueIDValidation = () => {
            let valid = true;
            let seatID = this.modal.find('input[name="seatID"]').val();
            if (seatID == this.seat.id) return valid;
            valid = Floor(floorID).getSeats().find(seat => seat.id == seatID) == undefined;
            if (!valid) {
              this.addNotification({
                status: 'ERROR',
                msg: 'Enter unique seat ID',
                code: 2
              });
            }
            return valid;
          };

          const init = () => {
            const self = this;
            const form = this.modal.find('.modal-form');
            const deleteBtn = this.modal.find('#modal-delete-btn');

            const employeeNameField = form.find('input[name="userName"]');
            const employeeIDField = form.find('input[name="employeeID"]');
            const employeeFieldContainer = form.find('.modal-form-control-container--employee');
            const employeeList = form.find('.modal-employee-list');

            const clearEmployeeList = () => {
              employeeNameField.val('');
              employeeIDField.val('');
              employeeList.html('');
              form.find('.glyphicon-remove--employee').remove();
            };

            form.find('.glyphicon-remove--employee').click(event => {
              event.preventDefault();
              clearEmployeeList();
            });

            employeeNameField.keyup(() => {
              const query = employeeNameField.val().toLowerCase();
              let newList = this.employees.slice(0)
                .filter(employee =>
                  employee.firstName.toLowerCase().indexOf(query) != -1 ||
                  employee.lastName.toLowerCase().indexOf(query) != -1 ||
                  (employee.firstName.toLowerCase() + ' ' + employee.lastName.toLowerCase()).indexOf(query) != -1
                )
                .map(employee => `<li data-id="${employee.id}">${employee.firstName} ${employee.lastName}</li>`)
                .sort();
              form.find('.glyphicon-remove--employee').remove();
              employeeList.html(newList.length != this.employees.length ? newList.join('') : '');
            });

            employeeList.click(event => {
              const employee = this.getEmployee(event.target.dataset.id);
              employeeNameField.val(`${employee.firstName} ${employee.lastName}`);
              employeeIDField.val(employee.id);
              employeeList.html('');
              const removeIcon = form.find('.glyphicon-remove--employee');
              if (!removeIcon.length) {
                const removeIcon = window.jQuery(removeEmployeeIcon);
                removeIcon.click(event => {
                  event.preventDefault();
                  clearEmployeeList();
                });
                employeeFieldContainer.append(removeIcon);
              }
            });

            this.modal.find('input[required]').keyup(function() {
              if (this.value.length) self.removeNotification({code: 1});
            });

            this.modal.find('.modal-notification-msg').click(function() {
              self.removeNotification({code: this.dataset.code});
            });

            form.submit(event => {
              event.preventDefault();
              if (!emptyIDValidation() || !uniqueIDValidation()) return;
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
          return this.employees.find(employee => employee.id == employeeID);
        };


        this.setStatus = (status) => {
          switch (status) {
          case 'ERROR':
            this.modal.addClass('modal-status--error');
            break;
          case 'NONE':
            this.modal.removeClass('modal-status--error');
            break;
          }
        };


        this.addNotification = (notification = {}) => {
          if (!notification.code) return;
          let container = this.modal.find('.modal-notification-msg');
          this.setStatus(notification.status);
          container.attr('data-code', notification.code);
          container.html(notification.msg);
          $timeout(() => {
            container.addClass('modal-notification-msg--active');
          }, 300);
        };


        this.removeNotification = (notification = {}) => {
          if (!notification.code) return;
          const container = this.modal.find(`.modal-notification-msg[data-code="${notification.code}"]`);
          if (!container.length) return;
          container.removeClass('modal-notification-msg--active');
          $timeout(() => {
            this.setStatus('NONE');
            container.html('');
          }, 300);
        };
      }
    ],

    bindings: {
      mapcanvas: '<',
    },

    template: `
      <div class="modal-container">
        <div id="modal"></div>
      </div>
    `,
  });
