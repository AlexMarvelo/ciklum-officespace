'use strict';

angular.
  module('core.comments').
  factory('Comments', ['$resource', 'CONFIG',
    ($resource, CONFIG) => {
      const serverRequest = $resource(`${CONFIG.appDomain}/comments/:action`, { action: 'add' }, {
        add: {
          method: 'POST',
          params: {
            action: 'add'
          }
        },
        remove: {
          method: 'POST',
          params: {
            action: 'remove'
          }
        }
      });

      return {
        serverRequest
      };
    }
  ]);
