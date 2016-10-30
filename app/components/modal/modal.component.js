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
        const modalTools = `
          <div class="modal-notification-container">
            <span class="modal-notification-msg"></span>
          </div>
          <span class="modal-navigation modal-navigation-left"></span>
          <span class="modal-navigation modal-navigation-right"></span>`;
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
          overlayColor: 'rgba(0,0,0,0.1)',
          onClosing: () => {
            $scope.$apply(() => {
              Floor(floorID).setActiveSeat(undefined);
              Employees.setActiveEmployee(undefined);
            });
            this.mapcanvas.deactivateAllSeats();
          },
          onClosed: () => {
            this.modal.iziModal('destroy');
            this.modal.empty();
          },
        };
        const seatDetailsModal = Object.assign(modalFrame, {
          title: 'Seat details',
          subtitle: 'Only admin can change data here',
        });
        const seatEditModal = Object.assign(modalFrame, {
          title: 'Update seat',
          subtitle: 'Seat ID must be unique on the floor',
        });
        const employeeDetailsModal = Object.assign(modalFrame, {
          title: 'Employee details',
          subtitle: this.authorized ? 'You can change seat only' : 'Only admin can change employee data',
        });

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
          Employees.getActiveEmployee,
          employee => {
            const oldEmlployee = this.employee;
            this.employee = employee;
            if (oldEmlployee && this.employee && oldEmlployee.id != this.employee.id) {
              this.updateEmployeeDetailsModal();
              return;
            }
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

        $scope.$watch(
          () => this.authorized != undefined &&
                this.employee != undefined &&
                this.employees != undefined,
          (ready) => {
            if (!ready) return;
            if (this.seat != undefined) {
              this.updateEmployeeDetailsModal();
              return;
            }
            this.initEmployeeModal();
          }
        );

        $rootScope.$on('$stateChangeStart',
          (event, toState, toParams, fromState) => {
            if (toState.name == fromState.name) return;
            if (this.modal) {
              Floor(floorID).setActiveSeat(undefined);
              Employees.setActiveEmployee(undefined);
              this.modal.iziModal('destroy');
              this.modal.empty();
            }
          }
        );


        this.initSeatModal = () => {
          const template = this.authorized ? this.getSeatEditTemplate() : this.getSeatDetailsTemplate();
          this.modal.html(template + modalTools);
          $timeout(() => {
            this.modal.iziModal(this.authorized ?
              Object.assign(seatEditModal, {
                onOpening: this.initSeatEditModal,
              }) :
              Object.assign(seatDetailsModal, {
                onOpening: this.initSeatDetailsModal,
              })
            );
          }, 0);
        };

        this.initSeatDetailsModal = () => {
          switch (this.config.attached) {
          case 'LEFT':
            this.attachToLeft();
            break;
          case 'RIGHT':
            this.attachToRight();
          }
        };

        this.initSeatEditModal = () => {
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


        this.updateSeat = () => {
          const employeeIDField = this.modal.find('input[name="employeeID"]');
          let newSeat = Object.assign({}, this.seat);
          newSeat.title = this.modal.find('input[name="title"]').val();
          newSeat.id = this.modal.find('input[name="seatID"]').val();
          newSeat.employeeID = employeeIDField.val().length ? employeeIDField.val() : undefined;
          if (this.seat.title == newSeat.title &&
              this.seat.id == newSeat.id &&
              this.seat.employeeID == newSeat.employeeID) {
            this.modal.iziModal('close');
            return;
          }
          confirm({
            msg: `Are you sure to update ${this.seat.id} with new values?`
          })
          .then(() => {
            $scope.$apply(() => {
              Floor(floorID).updateSeat(this.seat.id, newSeat);
            });
            this.mapcanvas.updateSeat(this.seat.id, newSeat);
            this.modal.iziModal('close');
          }, () => {})
          .catch(error => $log.error(error));
        };


        this.removeSeat = () => {
          let questionText = 'Are you sure you want to remove this seat?';
          const employee = this.getEmployee(this.modal.find('input[name="employeeID"]').val());
          if (employee) questionText += ` ${employee.firstName} ${employee.lastName} will lose the seat.`;
          confirm({
            msg: questionText
          })
          .then(() => {
            $scope.$apply(() => {
              Floor(floorID).removeSeat(this.seat);
            });
            this.mapcanvas.removeSeat(this.seat);
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
            this.seat.employeeID = undefined;
            $scope.$apply(() => {
              Floor(floorID).attachEmployeeToSeat(this.seat.id, undefined);
            });
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


        this.getSeatDetailsTemplate = () => {
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
          `;
        };


        this.getSeatEditTemplate = () => {
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
          `;
        };


        this.initEmployeeModal = () => {
          this.modal.html(this.getEmployeeDetailsTemplate() + modalTools);

          $timeout(() => {
            this.modal.iziModal(Object.assign(employeeDetailsModal,{
              onOpening: this.initEmployeeModalContent,
            }));
          }, 0);
        };


        this.updateEmployeeDetailsModal = () => {
          const title = this.modal.find('.iziModal-header-title');
          title.empty();
          title.html(employeeDetailsModal.title);
          const subtitle = this.modal.find('.iziModal-header-subtitle');
          subtitle.empty();
          subtitle.html(employeeDetailsModal.subtitle);
          const content = this.modal.find('.iziModal-content');
          content.empty();
          content.html(this.getEmployeeDetailsTemplate() + modalTools);
          this.initEmployeeModalContent();
        };


        this.initEmployeeModalContent = () => {
          const form = this.modal.find('form');

          switch (this.config.attached) {
          case 'LEFT':
            this.attachToLeft();
            break;
          case 'RIGHT':
            this.attachToRight();
          }

          this.loadEmployeeSeatID();

          form.submit(event => {
            event.preventDefault();
            const seatID = form.find('input[name="seatID"]').val();
            if (seatID == this.employee.seatID || (!seatID.length && !this.employee.seatID)) {
              this.modal.iziModal('close');
            }
            let msg;
            if (seatID.length) {
              msg = `Are you sure to assign ${this.employee.firstName} ${this.employee.lastName} to the seat with id ${seatID}`;
            } else {
              msg = 'Are you sure to release seat from this occupant?';
            }
            confirm({
              msg: msg
            })
            .then(() => {
              if (seatID.length) {
                $scope.$apply(() => {
                  Floor(floorID).attachEmployeeToSeat(seatID, this.employee.id);
                });
                this.mapcanvas.activateOneSeat(seatID);
              } else {
                $scope.$apply(() => {
                  Floor(floorID).attachEmployeeToSeat(this.employee.seatID, undefined);
                });
                this.mapcanvas.deactivateAllSeats();
              }
              this.modal.iziModal('close');
            }, () => {});
          });
        };


        this.loadEmployeeSeatID = () => {
          if (this.employee.seatID) {
            this.pasteEmployeeSeatIDBlock(this.employee.seatID);
            this.mapcanvas.activateOneSeat({id: this.employee.seatID});
          } else {
            const seat = Floor(floorID).getSeatByEmployee(this.employee);
            const seatFloorID = seat ? seat.floorID : undefined;
            const seatID = seat ? seat.id : undefined;
            if (seatFloorID != floorID && seatID) {
              // TODO floor redirection
            } else {
              this.pasteEmployeeSeatIDBlock(seatID);
              this.mapcanvas.activateOneSeat({id: seatID});
              this.employee.seatID = seatID;
            }
          }
        };


        this.pasteEmployeeSeatIDBlock = (seatID) => {
          const saveBlock = window.jQuery(`
            <div class="form-group modal-form-group--last">
              <div class="col-xs-6 col-thinpad-right">
              </div>
              <div class="col-xs-6 col-thinpad-left">
                <button type="submit" class="btn btn-default modal-btn-control" tabindex="22">Save</button>
              </div>
            </div>`);
          const form = this.modal.find('form');
          const seatIDContainer = form.find('.modal-employeeSeatID-container');
          if (this.authorized) {
            seatIDContainer.html(`<input name="seatID" type="text" value="${seatID ? seatID : ''}" placeholder="free" class="form-control modal-form-control" id="inputEmployee1" tabindex="21">`);
            form.append(saveBlock);
          } else {
            seatIDContainer.html('<p class="modal-input-value"><i>free</i></p>');
          }
        };


        this.getEmployeeDetailsTemplate = () => {
          return `
            <form class="modal-form form-horizontal" action="#" autocomplete="off" novalidate>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Employee</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">${this.employee.firstName} ${this.employee.lastName}</p>
                </div>
              </div>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Email</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">${this.employee.email}</p>
                </div>
              </div>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right" for="inputEmployee1">Seat ID</label>
                <div class="col-xs-8 col-thinpad-left modal-employeeSeatID-container">
                  <p class="modal-input-value">Loading...</p>
                </div>
              </div>
            </form>
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
