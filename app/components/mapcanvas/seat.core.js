'use strict';

const colors = require('../../config/colors.json');

class Seat {
  constructor(draw, $scope, coords = {x:0, y:0}, id = (new Date()).toISOString(), userID) {
    this.config = {
      radius: 8,
      strokeWidth: 8,
      transitionDuration: 200,
    };

    this.$scope = $scope;
    this.x = coords.x;
    this.y = coords.y;
    this.id = id;
    this.active = false;
    this.userID = userID;
    this.svg = draw.nested().circle(this.config.radius * 2)
      .fill(colors.themeSubcolor)
      .stroke({ color: colors.themeColor, opacity: 0.6, width: this.config.strokeWidth })
      .center(this.x, this.y)
      .addClass('seat');


    this.svg.click((event) => {
      this.$scope.$apply(() => {
        $scope.activeSeatID = this.id;
        event.preventDefault();
        this.onSelect();
      });
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
}

module.exports = Seat;
