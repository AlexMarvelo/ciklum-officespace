'use strict';

const colors = require('../../config/colors.json');

class Seat {
  constructor(mapcanvas, coords = {x:0, y:0}, id = (new Date()).toISOString(), employeeID, tooltipTitle) {
    this.config = {
      radius: 8,
      strokeWidth: 8,
      transitionDuration: 300,
    };

    this.authorized = mapcanvas.authorized;
    this.mapcanvas = mapcanvas;
    this.x = coords.x;
    this.y = coords.y;
    this.id = id;
    this.employeeID = employeeID;
    this.active = false;

    this.group = this.mapcanvas.draw.group();
    this.svg = this.group.circle(this.config.radius * 2)
      .fill(colors.themeSubcolor)
      .stroke({ color: colors.themeColor, opacity: 0.6, width: this.config.strokeWidth })
      .center(this.x, this.y)
      .addClass('seat');

    this.setTooltip(tooltipTitle);

    if (this.authorized) {
      this.group.draggable({
        // TODO fix dragging limits
        // minX: - this.x + this.config.radius,
        // minY: - this.y + this.config.radius,
        // maxX: this.mapcanvas.width - this.x,
        // maxY: this.mapcanvas.height - this.y
      });

      // TODO fix dragging jsut after creating seat by click - not moving

      this.group.on('dragstart.seat', event => {
        this.oldX = event.detail.p.x;
        this.oldY = event.detail.p.y;
        this.status = 'dragging';
        this.hideTooltip();
      });

      this.group.on('dragend.seat', event => {
        const newX = event.detail.p.x;
        const newY = event.detail.p.y;
        this.x = this.x + newX - this.oldX;
        this.y = this.y + newY - this.oldY;
        this.status = undefined;
        this.showTooltip();
        this.active = true;
        this.mapcanvas.$scope.$apply(() => {
          this.mapcanvas.$scope.activeSeat = {
            id: this.id,
            x: this.x,
            y: this.y,
            moved: newX - this.oldX != 0 || newY - this.oldY != 0,
          };
        });
      });
    }

    this.svg.click(() => {
      if (this.active) return;
      this.active = true;
      this.mapcanvas.$scope.$apply(() => {
        this.mapcanvas.$scope.activeSeat = {
          id: this.id,
          x: this.x,
          y: this.y,
        };
      });
    });
  }


  setTooltip(title = 'free') {
    this.tooltip = this.group.plain(title)
      .center(this.x, this.y + this.config.radius + 13)
      .addClass('seat-tooltip')
      .attr({opacity: 0 });
    this.svg.mouseover(() => {
      this.showTooltip();
    });
    this.svg.mouseout(() => {
      if (this.active) return;
      this.hideTooltip();
    });
  }


  setTooltipTitle(title = '') {
    this.tooltip
      .plain(title.length ? title : 'free')
      .cx(this.x);
  }


  showTooltip() {
    if (this.status == 'dragging') return;
    this.tooltip
      .animate(this.config.transitionDuration)
      .attr({opacity: 0.7 });
  }


  hideTooltip() {
    this.tooltip
      .animate(this.config.transitionDuration)
      .attr({opacity: 0 });
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
      .radius(this.config.radius + 2)
      .stroke({opacity: 0.4, width: 6 });
    this.showTooltip();
  }


  deactivate() {
    this.active = false;
    this.svg
      .removeClass('seat--active')
      .animate(this.config.transitionDuration)
      .radius(this.config.radius)
      .stroke({opacity: 0.6, width: this.config.strokeWidth });
    this.hideTooltip();
  }


  remove() {
    this.hideTooltip();
    this.svg
      .removeClass('seat--active')
      .animate(this.config.transitionDuration)
      .fill(colors.themeColor)
      .radius(0)
      .stroke({ width: 0 });
    setTimeout(() => {
      this.svg.remove();
      this.tooltip.remove();
    }, this.config.transitionDuration);
  }
}

module.exports = Seat;
