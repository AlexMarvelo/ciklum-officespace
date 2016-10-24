'use strict';

angular.
  module('entryForm').
  component('entryLogin', {
    controller: ['$scope', '$log', '$state', 'User', 'Notifications',
      function EntryLoginCtrl($scope, $log, $state, User, Notifications) {
        this.static = {
          formHeader: 'Login',
          btnText: 'Login',
          signupLink: {
            text: 'Don\'t have an account? Sign up',
            state: 'signup'
          }
        };

        this.login = (event) => {
          event.preventDefault();
          User.serverRequest.login({ email: $scope.email, password: $scope.password }, (user) => {
            if (user.local == undefined) return;
            $log.debug(`- logged in as ${user.local.email}`);
            User.set(user);
            $state.go('home');
          }, (error) => {
            if (error.status == 401) Notifications.add(Notifications.codes.unauthorized);
          });
        };
      }
    ],

    template: `
    <div class="container">
      <div class="row">
        <div class="col-sm-4 col-sm-push-4 text-center">
          <form action="/user/login" method="post" class="entry-form" autocomplete="on" ng-submit="$ctrl.login($event)">
            <h2>{{$ctrl.static.formHeader}}</h2>
            <div class="form-group">
              <input name="email" ng-model="email" type="text" class="form-control" placeholder="Email" tabindex="1">
              <input name="password" type="password" ng-model="password" class="form-control" placeholder="Password" tabindex="2">
            </div>
            <button type="submit" class="btn btn-default" tabindex="3">{{$ctrl.static.btnText}}</button>
          </form>
          <a ui-sref="{{$ctrl.static.signupLink.state}}" tabindex="4">{{$ctrl.static.signupLink.text}}</a>
        </div>
      </div>
    </div>
    `,
  });
