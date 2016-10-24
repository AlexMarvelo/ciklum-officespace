'use strict';

angular.
  module('search').
  component('search', {
    controller: [
      function NavbarCtrl() {
        this.searchQuery = '';

        this.$onInit = () => {
          this.employees = [{
            'firstName': 'Alexey',
            'lastName': 'Mironenko',
            'email': 'mironenkoalexey@gmail.com',
            'userID': 'asd1'
          }, {
            'firstName': 'Yana',
            'lastName': 'Ripenko',
            'email': 'yanaripenko@gmail.com',
            'userID': 'asd2'
          }, {
            'firstName': 'Anya',
            'lastName': 'Panasyuk',
            'email': 'anyapanasyuk@gmail.com',
            'userID': 'asd3'
          }, {
            'firstName': 'Egor',
            'lastName': 'Gangalo',
            'email': 'egorgangalo@gmail.com',
            'userID': 'asd4'
          }, {
            'firstName': 'Krus',
            'lastName': 'Krus',
            'email': 'krus@gmail.com',
            'userID': 'asd5'
          }, {
            'firstName': 'Maria',
            'lastName': 'Kozlova',
            'email': 'mariakozlova@gmail.com',
            'userID': 'asd6'
          }, {
            'firstName': 'David',
            'lastName': 'Bogdan',
            'email': 'davidbogdan@gmail.com',
            'userID': 'asd7'
          }, {
            'firstName': 'Alexey',
            'lastName': 'Bondar',
            'email': 'alexeybondar@gmail.com',
            'userID': 'asd8'
          }, {
            'firstName': 'Alexander',
            'lastName': 'Rak',
            'email': 'alexanderrak@gmail.com',
            'userID': 'asd9'
          }, {
            'firstName': 'Andrew',
            'lastName': 'Sklyar',
            'email': 'andrewsklyar@gmail.com',
            'userID': 'asd10'
          }];
        };

        this.onSearchSubmit = (event) => {
          event.preventDefault();
        };

        this.onEmployeeSelect = (employee) => {
          console.log(`${employee.firstName} ${employee.lastName}`);
        };

        this.nameSearch = (employee) => {
          return employee.firstName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 employee.lastName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1;
        };
      }
    ],

    template: `
      <div class="search-container">
        <form action="#" class="search-form" ng-submit="$ctrl.onSearchSubmit($event)">
          <input ng-model="$ctrl.searchQuery" class="search-input" placeholder="Search">
        </form>
        <ul class="search-result-list" ng-show="$ctrl.searchQuery.length > 0">
          <li ng-repeat="employee in $ctrl.employees | filter: $ctrl.nameSearch" class="search-result-item" ng-click="$ctrl.onEmployeeSelect(employee)">{{employee.firstName}} {{employee.lastName}}</li>
          <li ng-show="($ctrl.employees | filter: $ctrl.searchQuery).length == 0" class="search-result-item search-result-item-disabled">No results</li>
        </ul>
      </div>
    `,
  });
