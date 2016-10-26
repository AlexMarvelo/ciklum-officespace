'use strict';

angular.
  module('core.user').
  factory('User', [
    '$state', '$log', '$resource', 'localStorageService', 'CONFIG',
    function($state, $log, $resource, localStorageService, CONFIG) {
      const serverRequest = $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/user/:action`, {action: 'get'}, {
        get: {
          method: 'GET',
          params: {
            action: 'get'
          }
        },
        login: {
          method: 'POST',
          params: {
            action: 'login'
          }
        },
        signup: {
          method: 'POST',
          params: {
            action: 'signup'
          }
        },
        logout: {
          method: 'GET',
          params: {
            action: 'logout'
          }
        }
      });

      const authorized = () => this.user != undefined;

      const init = () => {
        this.user = localStorageService.get('user') || undefined;
        update();
      };

      const update = () => {
        serverRequest.get(user => {
          if (user.local == undefined) {
            this.user = undefined;
            return;
          }
          this.user = user;
          $log.debug(`- Authorization init. User: ${this.user.local.email}`);
          localStorageService.set('user', this.user);
        });
      };

      const set = (user) => {
        this.user = user;
        localStorageService.set('user', this.user);
      };

      const get = () => this.user;

      const clear = () => {
        this.user = undefined;
        localStorageService.set('user', this.user);
      };

      const getMode = () => this.mode;
      const setMode = mode => {
        this.mode = mode;
        if (this.mode) {
          $log.debug(`- set user mode to ${this.mode}`);
        } else {
          $log.debug('- unset user mode');
        }
      };

      return {
        init,
        authorized,
        clear,
        get,
        set,
        getMode,
        setMode,
        serverRequest
      };
    }
  ]);
