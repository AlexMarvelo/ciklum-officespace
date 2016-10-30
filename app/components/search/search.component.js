'use strict';

angular.
  module('search').
  component('search', {
    controller: ['$scope', 'Employees',
      function SearchCtrl($scope, Employees) {
        this.searchQuery = '';
        this.employees = [];
        this.showResults = true;

        this.$onInit = () => {
          const form = window.jQuery('.search-form');
          const list = window.jQuery('.search-result-list-container');
          const maxHeight = window.jQuery(window).height() - form.height();
          list.css('max-height', maxHeight);
        };


        $scope.$watch(Employees.get, employees => {
          this.employees = employees;
        });


        this.onSearchSubmit = (event) => {
          event.preventDefault();
        };


        this.onSearchFocus = () => {
          this.showResults = true;
        };


        this.onEmployeeSelect = (employee) => {
          Employees.setActiveEmployee(employee);
          this.showResults = false;
        };


        this.nameSearch = (employee) => {
          const fullName = employee.firstName.toLowerCase() + ' ' + employee.lastName.toLowerCase();
          return employee.firstName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 employee.lastName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 fullName.indexOf(this.searchQuery.toLowerCase()) != -1 ||
                 employee.email.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1;
        };
      }
    ],

    template: `
      <div class="search-container">
        <form action="#" class="search-form" ng-submit="$ctrl.onSearchSubmit($event)">
          <input ng-model="$ctrl.searchQuery" ng-focus="$ctrl.onSearchFocus()" class="search-input" placeholder="Search">
        </form>
        <div class="search-result-list-container">
          <ul ng-if="$ctrl.showResults" class="search-result-list" ng-show="$ctrl.searchQuery.length > 0">
            <li ng-repeat="employee in $ctrl.employees | filter: $ctrl.nameSearch | orderBy: 'firstName'" class="search-result-item" ng-click="$ctrl.onEmployeeSelect(employee)">
              <span class="search-result-item-title">{{employee.firstName}} {{employee.lastName}}</span>
              <span class="search-result-item-subtitle">{{employee.email}}<span>
            </li>
            <li ng-show="($ctrl.employees | filter: $ctrl.nameSearch).length == 0" class="search-result-item search-result-item-disabled">No results</li>
          </ul>
        </div>
      </div>
    `,
  });
