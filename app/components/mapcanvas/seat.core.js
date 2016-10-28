'use strict';

const colors = require('../../config/colors.json');

class Seat {
  constructor(draw, $scope, coords = {x:0, y:0}, id = (new Date()).toISOString(), title, employeeID) {
    this.config = {
      radius: 8,
      strokeWidth: 8,
      transitionDuration: 200,
    };

    this.$scope = $scope;
    this.x = coords.x;
    this.y = coords.y;
    this.id = id;
    this.title = title;
    this.active = false;
    this.employeeID = employeeID;

    this.svg = draw.circle(this.config.radius * 2)
      .fill(colors.themeSubcolor)
      .stroke({ color: colors.themeColor, opacity: 0.6, width: this.config.strokeWidth })
      .center(this.x, this.y)
      .addClass('seat');


    this.svg.click((event) => {
      event.preventDefault();
      this.onSelect();
    });
  }


  onSelect() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }


  activate() {
    this.active = true;
    this.$scope.$apply(() => {
      this.$scope.activeSeatID = this.id;
    });
    this.svg
      .addClass('seat--active')
      .animate(this.config.transitionDuration)
      .fill(colors.themeColor_dark);
  }


  deactivate() {
    this.active = false;
    this.svg
      .removeClass('seat--active')
      .animate(this.config.transitionDuration)
      .fill(colors.themeSubcolor);
  }


  remove() {
    this.svg
      .removeClass('seat--active')
      .animate(this.config.transitionDuration)
      .fill(colors.themeColor)
      .radius(0)
      .stroke({ width: 0 });
    setTimeout(() => {this.svg.remove();}, this.config.transitionDuration);
  }
}

module.exports = Seat;
