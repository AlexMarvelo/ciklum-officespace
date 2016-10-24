'use strict';

angular.
  module('entryForm').
  component('entryRegister', {
    controller: [
      '$log', '$scope', '$state', 'User', 'Notifications',
      function EntryLoginCtrl($log, $scope, $state, User, Notifications) {
        this.static = {
          formHeader: 'Sign up',
          btnText: 'Sign up',
          loginLink: {
            text: 'Already have an account? Login',
            state: 'login'
          }
        };

        this.signup = (event) => {
          event.preventDefault();
          User.serverRequest.signup({
            email: $scope.email,
            password: $scope.password
          }, (user) => {
            if (user.local == undefined) return;
            $log.debug(`- signed up & logged in as ${user.local.email}`);
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
          <form action="/user/signup" method="post" class="entry-form" ng-submit="$ctrl.signup($event)">
            <h2>{{$ctrl.static.formHeader}}</h2>
            <div class="input-group">
              <input name="email" ng-model="email" type="email" class="form-control" placeholder="Email" tabindex="1">
              <input name="password"type="password" ng-model="password" class="form-control" placeholder="Password" tabindex="2">
            </div>
            <button type="submit" class="btn btn-default" tabindex="3">{{$ctrl.static.btnText}}</button>
          </form>
          <a href="{{$ctrl.static.loginLink.state}}" tabindex="4">{{$ctrl.static.loginLink.text}}</a>
        </div>
      </div>
    </div>
    `,
  });
