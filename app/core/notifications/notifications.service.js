'use strict';

angular.
  module('core.notifications').
  factory('Notifications', ['$timeout', '$log',
    function($timeout, $log) {
      // types: success, info, warning, danger
      const timeout = 4000;
      const codes = {
        success: 200,
        badRequest: 400,
        unauthorized: 401,
        nopermission: 403,
        notFound: 404,
        serverError: 500,
        dbNotConnected: 503,
        svgNotSupported: 420,
      };
      const disabled = ['success'];

      this.notifications = [];
      this.notificationsLog = [];

      const get = () => this.notifications;
      const getLog = () => this.notificationsLog;

      const add = (code, notification) => {
        if (notification) {
          this.notifications.push(notification);
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
            msg: 'Authorization faild. Please, check email & password',
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
            msg: 'Server request was executed successfully',
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
        }
        if (!newNotification) return;
        if (disabled.find(disabledKey => codes[disabledKey] == newNotification.code)) return;
        newNotification.timestamp = (new Date()).toISOString();
        this.notifications.push(newNotification);
        this.notificationsLog.push(newNotification);
        $log.debug(`- add notification ${!notification ? '(code ' + code + ')' : ':'}`);
        if (notification) $log.debug(notification);
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
