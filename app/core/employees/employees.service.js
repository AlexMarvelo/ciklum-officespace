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


      const getActiveEmployee = () => this.activeEmployee;


      const setActiveEmployee = (activeEmployee) => {
        if (!activeEmployee) {
          if (this.activeEmployee) $log.debug('- unset active employee');
          this.activeEmployee = undefined;
          return;
        }
        if (activeEmployee.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        const targetEmployee = this.employees.find(employee => employee.id == activeEmployee.id);
        if (!targetEmployee) {
          Notifications.add(Notifications.codes.employeeNotFound);
          return;
        }
        this.activeEmployee = targetEmployee;
        $log.debug(`- set active employee to ${this.activeEmployee.id}` +
          `${this.activeEmployee.firstName && this.activeEmployee.lastName ? ' (' + this.activeEmployee.firstName + ' ' + this.activeEmployee.lastName + ')' : ''}`
        );
      };


      return {
        get,
        serverRequest,
        getActiveEmployee,
        setActiveEmployee
      };
    }
  ]);
