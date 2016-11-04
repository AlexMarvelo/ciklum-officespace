'use strict';

angular
  .module('CiklumSpace')
    .config([
      '$locationProvider',
      '$stateProvider',
      '$logProvider',
      '$urlRouterProvider',
      'localStorageServiceProvider',
      ($locationProvider, $stateProvider, $logProvider, $urlRouterProvider, localStorageServiceProvider) => {
        $locationProvider.hashPrefix('');
        $locationProvider.html5Mode(true);
        $logProvider.debugEnabled(true);
        $stateProvider.state({
          name: 'home',
          url: '/',
          template: '<homepage></homepage>'
        });
        $stateProvider.state({
          name: 'floor',
          url: '/floor/:floorID',
          template: '<floor></floor>'
        });
        $stateProvider.state({
          name: 'admin',
          url: '/admin',
          data: {
            authorization: true,
            redirectTo: 'login'
          },
          template: '<admin></admin>'
        });
        $stateProvider.state({
          name: 'login',
          url: '/login',
          template: '<entry-login></entry-lofin>'
        });
        $stateProvider.state({
          name: 'signup',
          url: '/signup',
          template: '<entry-register></entry-register>'
        });
        $urlRouterProvider.otherwise('/');
        localStorageServiceProvider
          .setPrefix('ciklumspace');
      }])

    .controller('CiklumSpace.Controller', [
      'User', 'Employees', 'Floor',
      function(User, Employees, Floor) {
        this.$onInit = () => {
          User.init();
          Employees.load();
          Floor().getAllConfigs(true)
            .catch(() => {});
        };
      }])

    .run([
      '$rootScope', '$state', 'User',
      ($rootScope, $state, User) => {
        $rootScope.$on('$stateChangeSuccess', (event, toState) => {
          if (!User.authorized() &&
              toState.data &&
              toState.data.authorization &&
              toState.data.redirectTo) {
            $state.go(toState.data.redirectTo);
          }
        });
      }])

    .constant('CONFIG', {
      'env': 'production',
      'consoleErrors': true,
      'appDomain_local': 'http://localhost:5000',
      'appDomain_remote': 'http://ciklumspace.herokuapp.com',
      'appName': 'Ciklum OfficeSpace'
    });
