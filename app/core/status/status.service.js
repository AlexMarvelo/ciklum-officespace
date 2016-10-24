'use strict';

angular.
  module('core.status').
  factory('Status', ['$resource', 'CONFIG',
    ($resource, CONFIG) => {
      const serverRequest = $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/status/:action`, {action: 'dbconnection'}, {
        dbconnection: {
          method: 'GET',
          params: {
            action: 'dbconnection'
          }
        }
      });

      return {
        serverRequest
      };
    }
  ]);
