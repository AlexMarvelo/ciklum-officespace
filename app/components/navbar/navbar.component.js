'use strict';

angular.
  module('navbar').
  component('navbar', {
    controller: ['$scope', '$state', '$rootScope', '$log', 'CONFIG', 'User',
      function NavbarCtrl($scope, $state, $rootScope, $log, CONFIG, User) {
        this.static = {
          homeBtn: {
            link: '/',
            state: 'home',
            title: CONFIG.appName,
          },
          loginBtn: {
            link: '/login',
            state: 'login',
            title: 'Login',
          },
          adminBtn: {
            link: '/admin',
            state: 'admin',
            title: 'Admin panel',
          },
          signupBtn: {
            link: '/signup',
            state: 'signup',
            title: 'Sign up',
          },
          logoutBtn: {
            link: '/logout',
            title: 'Logout',
          }
        };

        this.$onInit = () => {
          this.logined = false;
        };

        $rootScope.$on('$stateChangeStart',
          (event, toState) => {
            this.currentState = toState;
          }
        );

        $scope.$watch(User.authorized, (newValue) => {
          this.logined = newValue;
          this.user = User.get();
        });

        this.logout = (event) => {
          event.preventDefault();
          User.serverRequest.logout(() => {
            $log.debug('- logged out');
            User.clear();
            $state.go('login');
          });
        };

        this.drawMode = false;
        this.toggleDrawMode = (event) => {
          event.preventDefault();
          if (this.drawMode) {
            this.drawMode = false;
            User.setMode(undefined);
          } else {
            this.drawMode = true;
            User.setMode('draw');
          }
        };
      }
    ],

    template: `
      <nav class="navbar navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand navbar-brand-logo" ui-sref="{{$ctrl.static.homeBtn.state}}">
              <img ng-src="/images/favicon.ico" alt="{{$ctrl.static.homeBtn.title}}">
            </a>
            <a class="navbar-brand" ui-sref="{{$ctrl.static.homeBtn.state}}">
              {{$ctrl.static.homeBtn.title}}
            </a>
          </div>
          <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav navbar-right">
              <li ng-if="$ctrl.logined == true">  <a ui-sref="{{$ctrl.static.adminBtn.state}}">{{$ctrl.static.adminBtn.title}}</a></li>
              <li ng-if="$ctrl.logined == true && $ctrl.currentState.name == 'floor'">  <a href="#" ng-click="$ctrl.toggleDrawMode($event)" class="{{$ctrl.drawMode ? 'active' : ''}}">{{$ctrl.drawMode ? 'Exit drawing' : 'New seat'}}</a></li>
              <li ng-if="$ctrl.logined == true">  <a href="#" ng-click="$ctrl.logout($event)">{{$ctrl.static.logoutBtn.title}}</a></li>
              <li ng-if="$ctrl.logined == false"> <a ui-sref="{{$ctrl.static.loginBtn.state}}">{{$ctrl.static.loginBtn.title}}</a></li>
              <li ng-if="$ctrl.logined == false"> <a ui-sref="{{$ctrl.static.signupBtn.state}}">{{$ctrl.static.signupBtn.title}}</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `,
  });
