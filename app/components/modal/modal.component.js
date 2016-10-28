'use strict';

const colors = require('../../config/colors.json');
const confirm = require('../confirm/confirm.core');

angular.
  module('modal').
  component('modal', {
    controller: ['$scope', '$rootScope', '$stateParams', '$timeout', '$log', 'Floor', 'Employees', 'User',
      function ModalCtrl($scope, $rootScope, $stateParams, $timeout, $log, Floor, Employees, User) {
        const floorID = $stateParams.floorID;
        const modalWidth = 300;
        const modalNotificationDelay = 300;
        const sideIndent = 40;
        const notificationCodes = {
          requiredField: 1,
          uniqueField: 2,
        };
        const removeEmployeeIcon = '<span class="glyphicon glyphicon-remove glyphicon-remove--employee" aria-hidden="true"></span>';
        const modalFrame = {
          headerColor: colors.themeColor,
          attached: 'top',
          width: modalWidth,
          padding: 15,
          zindex: 1010,
          history: false,
          closeOnEscape: false,
          focusInput: false,
          autoOpen: true,
          navigateArrows: false,
          navigateCaption: false,
          onClosing: () => {
            $scope.$apply(() => {
              Floor(floorID).setActiveSeat(undefined);
            });
            this.mapcanvas.deactivateAllSeats();
          },
          onClosed: () => {
            this.modal.iziModal('destroy');
            this.modal.empty();
          },
        };

        this.config = {
          attached: 'RIGHT'
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
          this.modal.html(this.getDetailsTemplate());

          const init = () => {
            switch (this.config.attached) {
            case 'LEFT':
              this.attachToLeft();
              break;
            case 'RIGHT':
              this.attachToRight();
            }
          };

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
          this.modal.html(this.getEditTemplate());

          const init = () => {
            const self = this;
            const form = this.modal.find('.modal-form');
            const deleteBtn = this.modal.find('#modal-delete-btn');

            const employeeNameField = form.find('input[name="userName"]');
            const employeeIDField = form.find('input[name="employeeID"]');
            const employeeFieldContainer = form.find('.modal-form-control-container--employee');
            const unsetEmployeeIcon = form.find('.glyphicon-remove--employee');
            const employeeList = form.find('.modal-employee-list');

            switch (this.config.attached) {
            case 'LEFT':
              this.attachToLeft();
              break;
            case 'RIGHT':
              this.attachToRight();
            }

            unsetEmployeeIcon.click(event => {
              event.preventDefault();
              unsetEmployeeIcon.blur();
              this.unsetEmployee();
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
              const unsetEmployeeIcon = form.find('.glyphicon-remove--employee');
              if (!unsetEmployeeIcon.length) {
                const unsetEmployeeIcon = window.jQuery(removeEmployeeIcon);
                unsetEmployeeIcon.click(event => {
                  event.preventDefault();
                  unsetEmployeeIcon.blur();
                  this.unsetEmployee();
                });
                employeeFieldContainer.append(unsetEmployeeIcon);
              }
            });

            this.modal.find('input[required]').keyup(function() {
              if (this.value.length) self.removeNotification({code: notificationCodes.requiredField});
            });

            this.modal.find('.modal-notification-msg').click(function() {
              self.removeNotification({code: this.dataset.code});
            });

            form.submit(event => {
              event.preventDefault();
              if (!this.emptyIDValidation() || !this.uniqueIDValidation()) return;
              this.updateSeat();
            });

            deleteBtn.click(event => {
              event.preventDefault();
              deleteBtn.blur();
              this.removeSeat();
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


        this.updateSeat = () => {
          const employeeIDField = this.modal.find('input[name="employeeID"]');

          let newSeat = Object.assign({}, this.seat);
          newSeat.title = this.modal.find('input[name="title"]').val();
          newSeat.id = this.modal.find('input[name="seatID"]').val();
          newSeat.employeeID = employeeIDField.val().length ? employeeIDField.val() : undefined;

          $scope.$apply(() => {
            Floor(floorID).updateSeat(this.seat.id, newSeat);
          });
          this.mapcanvas.updateSeat(this.seat.id, newSeat);
          this.seat = undefined;
          this.modal.iziModal('close');
        };


        this.removeSeat = () => {
          let questionText = 'Are you sure you want to remove this seat?';
          const employee = this.getEmployee(this.modal.find('input[name="employeeID"]').val());
          if (employee) questionText += ` ${employee.firstName} ${employee.lastName} will lose the seat.`;
          confirm({
            msg: questionText
          })
          .then(() => {
            this.mapcanvas.removeSeat(this.seat);
            $scope.$apply(() => {
              Floor(floorID).removeSeat(this.seat);
            });
            this.seat = undefined;
            this.modal.iziModal('close');
          }, () => {})
          .catch(error => $log.error(error));
        };


        this.unsetEmployee = () => {
          const employee = this.getEmployee(this.modal.find('input[name="employeeID"]').val());
          let questionText = `Are you sure you want to remove ${employee.firstName} ${employee.lastName} from this seat?`;
          confirm({
            msg: questionText
          })
          .then(() => {
            this.clearEmployeeList();
          }, () => {})
          .catch(error => $log.error(error));
        };


        this.emptyIDValidation = () => {
          let valid = true;
          this.modal.find('input[required]').each(function() {
            if (!this.value.length) valid = false;
          });
          if (!valid) {
            this.addNotification({
              status: 'ERROR',
              msg: 'Fill all required fields',
              code: notificationCodes.requiredField
            });
          }
          return valid;
        };


        this.uniqueIDValidation = () => {
          let valid = true;
          let seatID = this.modal.find('input[name="seatID"]').val();
          if (seatID == this.seat.id) return valid;
          valid = Floor(floorID).getSeats().find(seat => seat.id == seatID) == undefined;
          if (!valid) {
            this.addNotification({
              status: 'ERROR',
              msg: 'Enter unique seat ID',
              code: notificationCodes.uniqueField
            });
          }
          return valid;
        };


        this.clearEmployeeList = () => {
          this.modal.find('input[name="userName"]').val('');
          this.modal.find('input[name="employeeID"]').val('');
          this.modal.find('.modal-employee-list').html('');
          this.modal.find('.glyphicon-remove--employee').remove();
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
          }, modalNotificationDelay);
        };


        this.removeNotification = (notification = {}) => {
          if (!notification.code) return;
          const container = this.modal.find(`.modal-notification-msg[data-code="${notification.code}"]`);
          if (!container.length) return;
          container.removeClass('modal-notification-msg--active');
          $timeout(() => {
            this.setStatus('NONE');
            container.html('');
          }, modalNotificationDelay);
        };


        this.attachToLeft = () => {
          this.modal.css({
            'left': modalWidth/2 + sideIndent,
            'right': 'auto',
            'margin-left': '0 !important',
          });
          this.modal.find('.modal-navigation-left').css('display', 'none').off('click');
          this.modal.find('.modal-navigation-right').css('display', 'block').click(event => {
            event.preventDefault();
            this.attachToRight();
          });
          this.config.attached = 'LEFT';
        };


        this.attachToRight = () => {
          this.modal.css({
            'left': 'auto',
            'right': modalWidth/2 + sideIndent,
            'margin-right': '0 !important',
          });
          this.modal.find('.modal-navigation-left').css('display', 'block').click(event => {
            event.preventDefault();
            this.attachToLeft();
          });
          this.modal.find('.modal-navigation-right').css('display', 'none').off('click');
          this.config.attached = 'RIGHT';
        };


        this.getDetailsTemplate = () => {
          const hasEmployee = this.seat.employeeID != undefined;
          const employee = this.getEmployee(this.seat.employeeID);
          return `
            <form class="modal-form form-horizontal" autocomplete="off" novalidate>
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
            <div class="modal-notification-container">
              <span class="modal-notification-msg"></span>
            </div>
            <span class="modal-navigation modal-navigation-left"></span>
            <span class="modal-navigation modal-navigation-right"></span>
          `;
        };


        this.getEditTemplate = () => {
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
                    placeholder="untitled"
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
                      placeholder="free"
                      tabindex="23"
                      id="inputSeat3">
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
            <div class="modal-notification-container">
              <span class="modal-notification-msg"></span>
            </div>
            <span class="modal-navigation modal-navigation-left"></span>
            <span class="modal-navigation modal-navigation-right"></span>
          `;
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
