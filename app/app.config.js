'use strict';

angular
  .module('OMDbHero')
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
          data: {
            authorization: true,
            redirectTo: 'login'
          },
          template: '<movies-block></movies-block>'
        });
        $stateProvider.state({
          name: 'movieDetails',
          url: '/movie/{movieID}',
          data: {
            authorization: true,
            redirectTo: 'login'
          },
          template: '<movie-details></movie-details>'
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
          .setPrefix('omdbhero');
      }])

    .controller('OMDbHero.Controller', [
      '$scope', '$rootScope', '$log', 'localStorageService', 'User', 'Notifications', 'Status',
      function($scope, $rootScope, $log, localStorageService, User, Notifications, Status) {
        this.$onInit = () => {
          User.init();
          this.checkDBconnection();
          this.favourites = localStorageService.get('favourites') || [];
        };

        this.checkDBconnection = () => {
          Status.serverRequest.dbconnection(res => {
            if (!res.dbconnected) {
              Notifications.add(Notifications.codes.dbNotConnected);
            }
          });
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
      'moviesPerPage': 10,
      'appDomain': 'http://localhost:3000',
      'omdbAPI': '6f0a67d0',
      'appName': 'OMDb Hero'
    });
