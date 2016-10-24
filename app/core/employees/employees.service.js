'use strict';

angular.
  module('core.employees').
  factory('Employees', ['$resource', 'Notifications', 'CONFIG',
    function($resource, Notifications, CONFIG) {
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
        this.employees = res.employees || [];
      });

      const get = () => this.employees;

      return {
        get,
        serverRequest
      };
    }
  ]);
