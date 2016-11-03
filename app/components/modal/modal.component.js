'use strict';

const colors = require('../../config/colors.json');
const confirm = require('../confirm/confirm.core');

angular.
  module('modal').
  component('modal', {
    controller: ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$log', 'Floor', 'Employees', 'Notifications', 'User',
      function ModalCtrl($scope, $rootScope, $state, $stateParams, $timeout, $log, Floor, Employees, Notifications, User) {
        const floorID = $stateParams.floorID;
        const modalWidth = 300;
        const modalNotificationDelay = 300;
        const sideIndent = 40;
        const notificationCodes = {
          requiredField: 1,
          uniqueField: 2,
        };
        const unsetEmployeeIconTemplate = '<span class="glyphicon glyphicon-remove glyphicon-remove--employee" aria-hidden="true" title="unattach occupant"></span>';
        const unsetSeatIconTemplate = '<span class="glyphicon glyphicon-remove glyphicon-remove--seat" aria-hidden="true" title="release seat"></span>';
        const setSeatIconTemplate = '<span class="glyphicon glyphicon-plus glyphicon-plus--seat" aria-hidden="true" title="attach to seat"></span>';
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
          overlayColor: 'rgba(0,0,0,0.3)',
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
        const seatDetailsModal = Object.assign({}, modalFrame, {
          title: 'Seat details',
          subtitle: 'Only admin can change data here',
        });
        const seatEditModal = Object.assign({}, modalFrame, {
          title: 'Update seat',
          subtitle: 'Seat ID must be unique on the floor',
        });
        const employeeDetailsModal = Object.assign({}, modalFrame, {
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
          User.getMode,
          userMode => {
            const oldMode = this.userMode;
            this.userMode = userMode;
            if (oldMode == 'selection' && this.userMode == undefined) {
              this.disableSelectionMode();
            }
          }
        );


        $scope.$watch(
          Floor(floorID).getActiveSeat,
          seat => {
            if (this.userMode == 'selection') {
              this.modal.find('input[name="seatTitle"]').val(`${seat.title || seat.id}`);
              this.modal.find('input[name="seatID"]').val(seat.id);
              this.mapcanvas.activateOneSeat(seat);
              this.disableSelectionMode();
              return;
            }
            this.seat = seat;
            if (this.seat) this.mapcanvas.activateOneSeat(this.seat);
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
                this.employees != undefined &&
                this.mapcanvas.ready,
          (ready) => {
            if (!ready) return;
            this.initSeatModal();
          }
        );

        $scope.$watch(
          () => this.authorized != undefined &&
                this.employee != undefined &&
                this.seats != undefined &&
                this.mapcanvas.ready,
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
            if (toState.name != fromState.name) {
              Floor(floorID).setActiveSeat(undefined);
              Employees.setActiveEmployee(undefined);
            }
            if (this.modal) {
              this.modal.iziModal('destroy');
              this.modal.empty();
            }
          }
        );




        //
        // modal utils
        // -----------


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






        // ------------------
        // seat modal methods
        // ------------------


        this.initSeatModal = () => {
          if (this.authorized) {
            this.modal.html(this.getSeatEditTemplate() + modalTools);
            $timeout(() => {
              this.modal.iziModal(Object.assign({}, seatEditModal, {
                onOpening: this.initSeatEditModal,
              }));
            }, 0);
          } else {
            this.modal.html(this.getSeatDetailsTemplate() + modalTools);
            $timeout(() => {
              this.modal.iziModal(Object.assign({}, seatDetailsModal, {
                onOpening: this.initSeatDetailsModal,
              }));
            }, 0);
          }
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

          const employeeNameField = form.find('input[name="employeeName"]');
          const employeeIDField = form.find('input[name="employeeID"]');
          const employeeFieldContainer = form.find('.modal-form-control-container--employee');
          const unsetEmployeeIcon = form.find('.glyphicon-remove--employee');
          const employeeList = form.find('.modal-search-list');

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
              .sort((a, b) => {
                if (a.firstName < b.firstName) return -1;
                if (a.firstName > b.firstName) return 1;
                return 0;
              })
              .map(employee => `<li data-id="${employee.id}">${employee.firstName} ${employee.lastName}</li>`);

            form.find('.glyphicon-remove--employee').remove();
            employeeList.html(query.length ? newList.join('') : '');
          });

          employeeList.click(event => {
            const employee = this.getEmployee(event.target.dataset.id);
            employeeNameField.val(`${employee.firstName} ${employee.lastName}`);
            employeeIDField.val(employee.id);
            employeeList.html('');

            const unsetEmployeeIcon = window.jQuery(unsetEmployeeIconTemplate);
            employeeFieldContainer.append(unsetEmployeeIcon);
            unsetEmployeeIcon.click(event => {
              event.preventDefault();
              unsetEmployeeIcon.blur();
              this.unsetEmployee();
            });
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
          const newEmployee = this.getEmployee(newSeat.employeeID);
          confirm({
            msg: `Are you sure to update ${this.seat.title || this.seat.id} seat with new values?`
          })
          .then(() => {
            Floor(floorID).updateSeat(this.seat.id, newSeat)
              .then(() => {
                if (newEmployee) this.mapcanvas.unattachEmployeeFromSeat(newEmployee);
                this.mapcanvas.updateSeat(this.seat.id, Object.assign({}, newSeat, {
                  tooltipTitle: newEmployee ? `${newEmployee.firstName} ${newEmployee.lastName}` : undefined
                }));
                this.modal.iziModal('close');
              }, () => {})
              .catch(error => $log.error(error));
          }, () => {});
        };


        this.removeSeat = () => {
          let questionText = 'Are you sure you want to remove this seat?';
          if (this.seat.employee) questionText += ` ${this.seat.employee.firstName} ${this.seat.employee.lastName} will lose the seat.`;
          confirm({
            msg: questionText
          })
          .then(() => {
            const seat = this.seat;
            Floor(floorID).removeSeat(this.seat)
              .then(() => {
                this.mapcanvas.removeSeat(seat);
                this.modal.iziModal('close');
              }, () => {})
              .catch(error => $log.error(error));
          }, () => {});
        };


        this.unsetEmployee = () => {
          const employee = this.getEmployee(this.modal.find('input[name="employeeID"]').val());
          let questionText = `Are you sure you want to remove ${employee.firstName} ${employee.lastName} from this seat?`;
          confirm({
            msg: questionText
          })
          .then(() => {
            Floor(floorID).attachEmployeeToSeat(this.seat.id, undefined)
              .then(() => {
                this.clearEmployeeList();
                this.seat.employeeID = undefined;
                this.mapcanvas.updateSeat(this.seat.id, Object.assign({}, this.seat, {
                  tooltipTitle: undefined
                }));
              }, () => {})
              .catch(error => $log.error(error));
          }, () => {});
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
          valid = this.seats ? this.seats.find(seat => seat.id == seatID) == undefined : true;
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
          this.modal.find('input[name="employeeName"]').val('');
          this.modal.find('input[name="employeeID"]').val('');
          this.modal.find('.modal-search-list').html('');
          this.modal.find('.glyphicon-remove--employee').remove();
        };


        this.getSeatDetailsTemplate = () => {
          const hasEmployee = this.seat.employeeID != undefined;
          const employee = this.getEmployee(this.seat.employeeID);
          return `
            <form class="modal-form form-horizontal" autocomplete="off" novalidate>
              <div class="form-group">
                <label class="col-xs-4 control-label col-thinpad-right">Seat title</label>
                <div class="col-xs-8 col-thinpad-left">
                  <p class="modal-input-value">${this.seat.title || '<i>untitled</i>'}</p>
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
                    value="${this.seat.title || ''}"
                    placeholder="untitled"
                    tabindex="21"
                    id="inputSeat1">
                </div>
              </div>
              <div class="form-group">
                <label for="inputSeat2" class="col-xs-4 control-label col-thinpad-right">Seat ID</label>
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
                      name="employeeName"
                      class="form-control modal-form-control modal-form-control--employee"
                      value="${hasEmployee && employee ? employee.firstName + ' ' + employee.lastName : ''}"
                      placeholder="free"
                      tabindex="23"
                      id="inputSeat3">
                    ${hasEmployee && employee ? unsetEmployeeIconTemplate : ''}
                  </div>
                  <input
                    type="hidden"
                    name="employeeID"
                    value="${hasEmployee ? this.seat.employeeID : ''}"
                    class="hidden">
                  <div class="modal-search-list-container">
                    <ul class="modal-search-list"></ul>
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


        this.getEmployee = (employeeID) => {
          return this.employees.find(employee => employee.id == employeeID);
        };






        // ----------------------
        // Employee modal methods
        // ----------------------


        this.initEmployeeModal = () => {
          this.modal.html(this.getEmployeeDetailsTemplate() + modalTools);
          $timeout(() => {
            this.modal.iziModal(Object.assign({}, employeeDetailsModal, {
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
            if ((this.employee.seat && seatID == this.employee.seat.id) || (!seatID.length && !this.employee.seatID)) {
              this.modal.iziModal('close');
              return;
            }
            const seat = this.getSeat(seatID);
            let msg;
            if (seatID.length) {
              msg = `Are you sure to attach ${this.employee.firstName} ${this.employee.lastName} to ${seat.title || seat.id} seat?`;
            } else {
              msg = `Are you sure to unattach ${this.employee.firstName} ${this.employee.lastName} from ${seat.title || seat.id} seat?`;
            }
            confirm({
              msg: msg
            })
            .then(() => {
              if (seatID.length) {
                Floor(floorID).attachEmployeeToSeat(seatID, this.employee.id)
                  .then(() => {
                    this.mapcanvas.setSeatTooltipTitle(seatID, `${this.employee.firstName} ${this.employee.lastName}`);
                    this.mapcanvas.activateOneSeat({id: seatID});
                    this.modal.iziModal('close');
                  }, () => {})
                  .catch(error => $log.error(error));
              } else {
                Floor(floorID).attachEmployeeToSeat(this.employee.seatID, undefined)
                  .then(() => {
                    this.mapcanvas.setSeatTooltipTitle(this.employee.seatID, undefined);
                    this.mapcanvas.deactivateAllSeats();
                    this.modal.iziModal('close');
                  }, () => {})
                  .catch(error => $log.error(error));
              }
            }, () => {});
          });
        };


        this.loadEmployeeSeatID = () => {
          Floor(floorID).getSeatByEmployee(this.employee)
            .then(seat => {
              this.employee.seat = seat;
              if (this.employee.seat && this.employee.seat.floorID != floorID) {
                this.pasteEmployeeAnotherSeatBlock();
                this.mapcanvas.deactivateAllSeats();
                return;
              }
              this.pasteEmployeeSeatBlock();
              this.mapcanvas.activateOneSeat(this.employee.seat);
            }, () => {})
            .catch(error => $log.error(error));
        };


        this.pasteEmployeeSeatBlock = () => {
          const saveBlock = window.jQuery(`
            <div class="form-group modal-form-group--last">
              <div class="col-xs-6 col-thinpad-right">
              </div>
              <div class="col-xs-6 col-thinpad-left">
                <button type="submit" class="btn btn-default modal-btn-control" tabindex="22">Save</button>
              </div>
            </div>`);
          const form = this.modal.find('form');
          const seatIDContainer = form.find('.modal-form-control-container--seat');

          if (!this.authorized) {
            seatIDContainer.html(`<p class="modal-input-value">${this.employee.seat ? this.employee.seat.title || this.employee.seat.id : '<i>free</i>'}</p>`);
            return;
          }

          seatIDContainer.html(`
            <input name="seatTitle" type="text" value="${this.employee.seat ? this.employee.seat.title || this.employee.seat.id : ''}" placeholder="free" class="form-control modal-form-control" id="inputEmployee1" tabindex="21">
            <input name="seatID" type="hidden" value="${this.employee.seat ? this.employee.seat.id : ''}">
            ${!this.employee.seat ? setSeatIconTemplate : ''}
            <div class="modal-search-list-container">
              <ul class="modal-search-list"></ul>
            </div>
            ${this.employee.seat ? unsetSeatIconTemplate : ''}
          `);
          form.append(saveBlock);

          const seatTitleField = form.find('input[name="seatTitle"]');
          const seatIDField = form.find('input[name="seatID"]');
          const setSeatIcon = form.find('.glyphicon-plus--seat');
          const unsetSeatIcon = form.find('.glyphicon-remove--seat');
          const seatList = form.find('.modal-search-list');

          unsetSeatIcon.click(event => {
            event.preventDefault();
            unsetSeatIcon.blur();
            this.unsetSeat();
          });

          setSeatIcon.click(event => {
            event.preventDefault();
            setSeatIcon.blur();
            this.setSeat();
          });

          seatTitleField.keyup(() => {
            const query = seatTitleField.val().toLowerCase();
            let newList = this.seats.slice(0)
              .filter(seat =>
                seat.id.toLowerCase().indexOf(query) != -1 ||
                (seat.title && seat.title.toLowerCase().indexOf(query) != -1)
              )
              .sort((a, b) => {
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                return 0;
              })
              .map(seat => `<li data-id="${seat.id}">${seat.title || seat.id}</li>`);
            form.find('.glyphicon-remove--seat').remove();
            seatList.html(query.length ? newList.join('') : '');
          });

          seatList.click(event => {
            const seat = this.getSeat(event.target.dataset.id);
            if (!seat) {
              $log.error('- seat with such ID not found');
              return;
            }
            seatTitleField.val(`${seat.title || seat.id}`);
            seatIDField.val(seat.id);
            seatList.html('');
            this.mapcanvas.activateOneSeat(seat);
            form.find('.glyphicon-plus--seat').remove();
            const unsetSeatIcon = window.jQuery(unsetSeatIconTemplate);
            seatIDContainer.append(unsetSeatIcon);
            unsetSeatIcon.click(event => {
              event.preventDefault();
              unsetSeatIcon.blur();
              this.unsetSeat();
            });
          });
        };


        this.pasteEmployeeAnotherSeatBlock = () => {
          const form = this.modal.find('form');
          const seatIDContainer = form.find('.modal-form-control-container--seat');
          seatIDContainer.html(`
            <p class="modal-input-value">${this.employee.seat.title || this.employee.seat.id}</p>
            <p class="modal-input-value">(This employee is occupying the seat on <a href="/floor/${this.employee.seat.floorID}" class="modal-link--floor">${this.employee.seat.floorID} floor</a>)</p>
          `);
          form.find('.modal-link--floor').click(event => {
            event.preventDefault();
            $state.go('floor', {floorID: this.employee.seat.floorID});
          });
        };


        this.setSeat = () => {
          this.enableSelectionMode();
        };


        this.unsetSeat = () => {
          if (!this.employee.seat) {
            this.mapcanvas.deactivateAllSeats();
            this.clearSeatsList();
            return;
          }
          const questionText = `Are you sure you want to unattach ${this.employee.firstName} ${this.employee.lastName} from ${this.employee.seat.title || this.employee.seat.id} seat?`;
          confirm({
            msg: questionText
          })
          .then(() => {
            Floor(floorID).attachEmployeeToSeat(this.employee.seat.id, undefined)
              .then(() => {
                this.mapcanvas.setSeatTooltipTitle(this.employee.seat.id, undefined);
                this.mapcanvas.deactivateAllSeats();
                this.employee.seat = undefined;
                this.clearSeatsList();
              }, () => {})
              .catch(error => $log.error(error));
          }, () => {});
        };


        this.clearSeatsList = () => {
          const form = this.modal.find('form');
          const seatIDContainer = form.find('.modal-form-control-container--seat');
          const setSeatIcon = window.jQuery(setSeatIconTemplate);
          form.find('input[name="seatTitle"]').val('');
          form.find('input[name="seatID"]').val('');
          form.find('.modal-search-list').html('');
          form.find('.glyphicon-remove--seat').remove();
          seatIDContainer.append(setSeatIcon);
          setSeatIcon.click(event => {
            event.preventDefault();
            setSeatIcon.blur();
            this.setSeat();
          });
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
                <label class="col-xs-4 control-label col-thinpad-right" for="inputEmployee1">Seat</label>
                <div class="col-xs-8 col-thinpad-left">
                  <div class="modal-form-control-container modal-form-control-container--seat">
                    <p class="modal-input-value">Loading...</p>
                  </div>
                </div>
              </div>
            </form>
          `;
        };


        this.getSeat = (seatID) => {
          return this.seats.find(seat => seat.id == seatID);
        };


        this.enableSelectionMode = () => {
          $scope.$apply(() => {
            User.setMode('selection');
          });
          Notifications.add(null, {msg: 'Choose a seat for occupant'});
          window.jQuery('.iziModal-overlay').fadeOut();
          window.jQuery('.iziModal#modal').addClass('iziModal-selection-mode').fadeOut();
        };


        this.disableSelectionMode = () => {
          this.userMode = undefined;
          User.setMode(undefined);
          window.jQuery('.iziModal-overlay').fadeIn();
          window.jQuery('.iziModal#modal').removeClass('iziModal-selection-mode').fadeIn();
        };
      }
    ],

    bindings: {
      mapcanvas: '<',
      seats: '<',
    },

    template: `
      <div class="modal-container">
        <div id="modal"></div>
      </div>
    `,
  });
