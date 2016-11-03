'use strict';

const colors = require('../../config/colors.json');

angular.
  module('notifier').
  component('notifier', {
    controller: ['$scope', 'Notifications',
      function NotifierCtrl($scope, Notifications) {
        this.notifications = [];
        const modalAlertWidth = 600;
        const modalHeight = 50;
        const modalAlertFrame = {
          attached: 'bottom',
          width: modalAlertWidth,
          padding: 0,
          zindex: 1010,
          history: false,
          closeOnEscape: true,
          focusInput: false,
          autoOpen: true,
          navigateArrows: false,
          navigateCaption: false,
          overlay: false,
          transitionIn: 'fadeInUp',
          transitionOut: 'fadeOutDown'
        };


        $scope.$watch(
          Notifications.get,
          updatedNotifications => {
            updatedNotifications.forEach(notification => {
              if (!this.notifications.find(n => n.timestamp == notification.timestamp)) {
                this.showNotification(Object.assign({}, notification));
              }
            });
            [].concat(this.notifications).forEach(notification => {
              if (!updatedNotifications.find(n => n.timestamp == notification.timestamp)) {
                this.hideNotification(Object.assign({}, notification));
              }
            });
          },
          true
        );


        this.showNotification = (notification) => {
          const modalAlert = window.jQuery('<div id="modal-alert"></div>');
          window.jQuery('body').append(modalAlert);
          modalAlert.css('bottom', this.notifications.length * (modalHeight+10));
          let color;
          switch (notification.type) {
          case 'success':
            color = colors.successColor;
            break;
          case 'info':
            color = colors.infoColor;
            break;
          case 'warning':
            color = colors.warningColor;
            break;
          case 'danger':
            color = colors.dangerColor;
            break;
          default:
            color = colors.themeColor;
          }
          const notificationFrame = Object.assign(modalAlertFrame, {
            title: notification.msg || 'Alert',
            headerColor: color,
            onOpening: () => {
              modalAlert.find('.iziModal-button-close').click(() => {
                $scope.$apply(() => {
                  Notifications.remove(notification);
                });
              });
            },
            onClosed: () => {
              modalAlert.iziModal('destroy');
              modalAlert.remove();
            },
          });
          modalAlert.iziModal(notificationFrame);
          modalAlert.iziModal('open');
          notification.modalAlert = modalAlert;
          this.notifications.push(notification);
        };


        this.hideNotification = (notification) => {
          notification.modalAlert.iziModal('close');
          const index = this.notifications.indexOf(
            this.notifications.find(n => n.timestamp == notification.timestamp)
          );
          this.notifications.forEach((n, i) => {
            if (i <= index) return;
            n.modalAlert.css('bottom', (i - 1) * (modalHeight+10));
          });
          this.notifications.splice(index, 1);
        };
      }
    ],
  });
