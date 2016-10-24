'use strict';

angular.
  module('notifier').
  component('notifier', {
    controller: ['$scope', 'Notifications',
      function NotifierCtrl($scope, Notifications) {
        this.notifications = [];

        $scope.$watch(
          Notifications.get,
          (notifications) => {
            this.notifications = notifications;
          }
        );

        this.removeNotification = notification => {
          Notifications.remove(notification);
        };
      }
    ],

    template: `
      <div class="notifier-container">
        <div class="container">
          <div class="notifier-centeredColumn">
            <div ng-repeat="notification in $ctrl.notifications" class="notifier-alert-container">
              <div class="alert alert-{{notification.type}} notifier-alert text-center" role="alert">
                {{notification.msg}}
                <span class="glyphicon glyphicon-remove" aria-hidden="true" ng-click="$ctrl.removeNotification(notification)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  });
