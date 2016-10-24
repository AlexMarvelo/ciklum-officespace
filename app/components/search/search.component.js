'use strict';

angular.
  module('search').
  component('search', {
    controller: ['$scope', 'Employees',
      function NavbarCtrl($scope, Employees) {
        this.searchQuery = '';

        this.employees = [];
        $scope.$watch(Employees.get, employees => {
          this.employees = employees;
        });

        this.onSearchSubmit = (event) => {
          event.preventDefault();
        };

        this.onEmployeeSelect = (employee) => {
          console.log(`${employee.firstName} ${employee.lastName}`);
        };

        this.nameSearch = (employee) => {
          const fullName = employee.firstName.toLowerCase() + ' ' + employee.lastName.toLowerCase();
          return employee.firstName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 employee.lastName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 fullName.indexOf(this.searchQuery.toLowerCase()) != -1;
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
          <li ng-show="($ctrl.employees | filter: $ctrl.nameSearch).length == 0" class="search-result-item search-result-item-disabled">No results</li>
        </ul>
      </div>
    `,
  });
