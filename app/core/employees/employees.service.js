'use strict';

angular.
  module('core.employees').
  factory('Employees', ['$log', '$resource', 'Notifications', 'CONFIG',
    function($log, $resource, Notifications, CONFIG) {
      const serverRequest = $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/employee/:action`, {action: 'get'}, {
        get: {
          method: 'GET',
          params: {
            action: 'get'
          }
        }
      });


      this.load = () => {
        return new Promise((resolve) => {
          serverRequest.get(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.employees = response.employees || [];
            Notifications.add(Notifications.codes.success);
            $log.debug(`- employees fetched. amount: ${this.employees.length}`);
            resolve(this.employees);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.get = () => this.employees;


      this.getActiveEmployee = () => this.activeEmployee;


      this.setActiveEmployee = (activeEmployee) => {
        try {
          if (!activeEmployee) {
            if (this.activeEmployee) $log.debug('- unset active employee');
            this.activeEmployee = undefined;
            return;
          }
          if (!activeEmployee.id) {
            throw { status: Notifications.codes.idRequired };
          }
          const targetEmployee = this.employees.find(employee => employee.id == activeEmployee.id);
          if (!targetEmployee) {
            throw { status: Notifications.codes.employeeNotFound };
          }
          this.activeEmployee = targetEmployee;
          $log.debug(`- set active employee to ${this.activeEmployee.id}` +
            `${this.activeEmployee.firstName && this.activeEmployee.lastName ? ' (' + this.activeEmployee.firstName + ' ' + this.activeEmployee.lastName + ')' : ''}`
          );
        } catch (error) {
          Notifications.add(error);
          if (CONFIG.consoleErrors) $log.error(error);
        }
      };


      return {
        get: this.get,
        load: this.load,
        getActiveEmployee: this.getActiveEmployee,
        setActiveEmployee: this.setActiveEmployee,
      };
    }
  ]);
