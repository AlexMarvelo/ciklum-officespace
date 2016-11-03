'use strict';

const notificationCodes = require('../../../share/config/notifications.json');

angular.
  module('core.notifications').
  factory('Notifications', ['$timeout', '$log',
    function($timeout, $log) {
      // types: success, info, warning, danger
      const timeout = 4000;
      const codes = notificationCodes;
      const ignored = ['success'];

      this.notifications = [];
      this.notificationsLog = [];


      const get = () => this.notifications;
      const getLog = () => this.notificationsLog;


      const add = (code, notification) => {
        if (notification) {
          notification.timestamp = (new Date()).toISOString();
          this.notifications.push(notification);
          this.notificationsLog.push(notification);
          $timeout(() => remove(notification), timeout);
          $log.debug('- add custom notification:');
          $log.debug(notification);
          return;
        }
        let newNotification;
        switch (code) {
        case codes.dbNotConnected:
          newNotification = {
            msg: 'Connection to local database failed. Remote one will be used',
            type: 'warning',
            code: codes.dbNotConnected
          };
          break;
        case codes.unauthorized:
          newNotification = {
            msg: 'Authorization failed. Please, check email & password',
            type: 'danger',
            code: codes.unauthorized
          };
          break;
        case codes.nopermission:
          newNotification = {
            msg: 'Sorry, action is not permited',
            type: 'danger',
            code: codes.nopermission
          };
          break;
        case codes.success:
          newNotification = {
            msg: 'Action was executed successfully',
            type: 'success',
            code: codes.success
          };
          break;
        case codes.serverError:
          newNotification = {
            msg: 'Server request failed',
            type: 'danger',
            code: codes.serverError
          };
          break;
        case codes.notFound:
          newNotification = {
            msg: 'Page not found. What you are looking for?',
            type: 'danger',
            code: codes.notFound
          };
          break;
        case codes.badRequest:
          newNotification = {
            msg: 'The request could not be understood by the server',
            type: 'danger',
            code: codes.badRequest
          };
          break;
        case codes.svgNotSupported:
          newNotification = {
            msg: 'SVG drowing is not supported',
            type: 'danger',
            code: codes.svgNotSupported
          };
          break;
        case codes.tooCloseSeat:
          newNotification = {
            msg: 'Seat is to close to another one. You can\'t place it here',
            type: 'warning',
            code: codes.tooCloseSeat
          };
          break;
        case codes.idRequired:
          newNotification = {
            msg: 'ID is required. Action denied',
            type: 'danger',
            code: codes.idRequired
          };
          break;
        case codes.floorIDRequired:
          newNotification = {
            msg: 'Floor ID is required. Action denied',
            type: 'danger',
            code: codes.floorIDRequired
          };
          break;
        case codes.idUnique:
          newNotification = {
            msg: 'ID must be unique. Action denied',
            type: 'danger',
            code: codes.idUnique
          };
          break;
        case codes.seatNotFound:
          newNotification = {
            msg: 'Seat with such ID wasn\'t found. Action denied',
            type: 'danger',
            code: codes.seatNotFound
          };
          break;
        case codes.employeeNotFound:
          newNotification = {
            msg: 'Employee with such ID wasn\'t found. Action denied',
            type: 'danger',
            code: codes.employeeNotFound
          };
          break;
        case codes.floorNotFound:
          newNotification = {
            msg: 'Floor with such ID wasn\'t found. Action denied',
            type: 'danger',
            code: codes.floorNotFound
          };
          break;
        }
        if (!newNotification) return;
        if (ignored.find(ignoredKey => codes[ignoredKey] == newNotification.code)) return;
        newNotification.timestamp = (new Date()).toISOString();
        this.notifications.push(newNotification);
        this.notificationsLog.push(newNotification);
        $log.debug(`- add notification ${!notification ? '(code ' + code + ', timestamp ' + newNotification.timestamp + ')' : ':'}`);
        $timeout(() => remove(newNotification), timeout);
      };


      const remove = (notification) => {
        if (!notification || !notification.timestamp) return;
        let prevAmount = this.notifications.length;
        this.notifications = this.notifications.filter(n => n.timestamp != notification.timestamp);
        if (prevAmount != this.notifications.length) {
          $log.debug(`- remove notification (code ${notification.code}, timestamp ${notification.timestamp})`);
        }
      };


      return {
        get,
        getLog,
        add,
        remove,
        codes
      };
    }
  ]);
