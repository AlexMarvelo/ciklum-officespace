'use strict';

angular.
  module('core.employees').
  factory('Employees', ['$log', '$resource', 'Notifications', 'CONFIG',
    function($log, $resource, Notifications, CONFIG) {
      const serverRequest = $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/employees/:action`, {action: 'get'}, {
        get: {
          method: 'GET',
          params: {
            action: 'get'
          }
        }
      });

      this.employees = [];


      serverRequest.get(res => {
        Notifications.add(res.status);
        if (res.status == Notifications.codes.success) {
          this.employees = res.employees || [];
          $log.debug(`- employees fetched. amount: ${this.employees.length}`);
        } else {
          $log.error(res);
        }
      });


      const get = () => this.employees;


      return {
        get,
        serverRequest
      };
    }
  ]);
