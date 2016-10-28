'use strict';

const colors = require('../../config/colors.json');

class Seat {
  constructor(mapcanvas, coords = {x:0, y:0}, id = (new Date()).toISOString(), title, employeeID) {
    this.config = {
      radius: 8,
      strokeWidth: 8,
      transitionDuration: 200,
    };

    this.mapcanvas = mapcanvas;
    this.x = coords.x;
    this.y = coords.y;
    this.id = id;
    this.title = title;
    this.active = false;
    this.employeeID = employeeID;

    this.svg = mapcanvas.draw.circle(this.config.radius * 2)
      .fill(colors.themeSubcolor)
      .stroke({ color: colors.themeColor, opacity: 0.6, width: this.config.strokeWidth })
      .center(this.x, this.y)
      .addClass('seat');
    this.svg.draggable({
      minX: 0,
      minY: 0,
      maxX: this.mapcanvas.width,
      maxY: this.mapcanvas.height,
    });


    this.svg.click(event => {
      event.preventDefault();
      this.onSelect();
    });

    this.svg.on('dragstart.seat', event => {
      this.oldX = event.detail.p.x;
      this.oldY = event.detail.p.y;
    });

    this.svg.on('dragend.seat', event => {
      const newX = event.detail.p.x;
      const newY = event.detail.p.y;
      this.x = this.x + newX - this.oldX;
      this.y = this.y + newY - this.oldY;
      this.mapcanvas.$scope.$apply(() => {
        this.mapcanvas.$scope.activeSeat = {
          id: this.id,
          x: this.x,
          y: this.y,
        };
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
