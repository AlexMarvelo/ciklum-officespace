'use strict';

const colors = require('../../config/colors.json');

class Seat {
  constructor(draw, $scope, coords = {x:0, y:0}, id = (new Date()).toISOString(), options = {}, userID) {
    this.config = {
      radius: 8,
      strokeWidth: 8,
      transitionDuration: 200,
      blockAreaRadius: options.blockAreaRadius || 25
    };

    this.$scope = $scope;
    this.x = coords.x;
    this.y = coords.y;
    this.id = id;
    this.active = false;
    this.userID = userID;

    // this.blockArea = draw.nested().circle(this.config.blockAreaRadius * 2)
    //   .fill('transparent')
    //   .center(this.x, this.y)
    //   .addClass('seat-blockArea');
    this.svg = draw.nested().circle(this.config.radius * 2)
      .fill(colors.themeSubcolor)
      .stroke({ color: colors.themeColor, opacity: 0.6, width: this.config.strokeWidth })
      .center(this.x, this.y)
      .addClass('seat');


    this.svg.click((event) => {
      this.$scope.$apply(() => {
        event.preventDefault();
        this.onSelect();
      });
    });
  }


  onSelect() {
    if (this.active) {
      this.deactivate();
      this.$scope.activeSeatID = undefined;
    } else {
      this.activate();
    }
  }


  activate() {
    this.active = true;
    this.$scope.activeSeatID = this.id;
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
