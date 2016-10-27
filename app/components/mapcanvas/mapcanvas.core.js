'use strict';

const Seat = require('./seat.core');

class Mapcanvas {
  constructor($scope, $log, floorID, modules) {
    this.$scope = $scope;
    this.$log = $log;
    this.Notifications = modules.Notifications;
    this.User = modules.User;
    this.Floor = modules.Floor;

    this.floorID = floorID;
    this.seats = [];

    this.config = {
      blockAreaRadius: 25
    };


    this.$scope.$watch(
      () => this.$scope.activeSeatID,
      seatID => {
        this.Floor(this.floorID).setActiveSeatID(seatID);
        this.seats.forEach(seat => {
          if (seat.id != seatID) seat.deactivate();
        });
      }
    );


    this.$scope.$watch(
      this.User.getMode,
      userMode => {
        this.userMode = userMode;
        switch (userMode) {
        case 'draw':
          if (this.draw) this.draw.addClass('mapcanvas-draw-mode');
          break;
        default:
          if (this.draw) this.draw.removeClass('mapcanvas-draw-mode');
        }
      }
    );
  }


  drawMapCanvas(containerID, containerWidth, containerHeight) {
    this.draw = SVG(containerID).size(containerWidth, containerHeight).addClass('mapcanvas-canvas');
    this.group = this.draw.group();

    this.draw.click(event => {
      event.preventDefault();
      const emptyPlaceClicked = event.target.id == this.draw.node.id;
      if (emptyPlaceClicked && this.User.authorized() && this.userMode == 'draw') this.addSeat({x: event.offsetX, y: event.offsetY});
    });
  }


  addSeat(coords = {x:0, y:0}, seatID = (new Date()).toISOString(), title, employeeID) {
    const isTooClose = this.seats.find(seat => {
      return Math.abs(seat.x - coords.x) < this.config.blockAreaRadius &&
             Math.abs(seat.y - coords.y) < this.config.blockAreaRadius;
    }) != undefined;
    if (isTooClose) {
      this.$scope.$apply(() => {
        this.Notifications.add(this.Notifications.codes.tooCloseSeat);
      });
      return;
    }

    let seat = new Seat(
      this.draw,
      this.$scope,
      coords,
      seatID,
      title,
      employeeID
    );
    this.seats.push(seat);
    this.group.add(seat.svg);
    this.Floor(this.floorID).addSeat({
      x: seat.x,
      y: seat.y,
      id: seat.id,
      employeeID: seat.employeeID,
      floorID: this.floorID,
    });
    return seat;
  }


  updateSeat(seatID, newSeat) {
    let seat = this.seats.find(s => s.id == seatID);
    if (!seat) return;
    seat.title = newSeat.title;
    seat.id = newSeat.id;
    seat.employeeID = newSeat.employeeID;
  }


  removeSeat(seat = {id: undefined}) {
    this.seats.find(s => s.id == seat.id).remove();
    this.seats = this.seats.filter(s => s.id != seat.id);
  }


  setSeats(seats = []) {
    seats.forEach(seat => {
      this.seats.push(new Seat(
        this.draw,
        this.$scope,
        {x: seat.x, y: seat.y},
        seat.id,
        seat.title,
        seat.employeeID
      ));
    });
  }


  deactivateAllSeats() {
    this.seats.forEach(seat => seat.deactivate());
    this.$scope.$apply(() => {
      this.$scope.activeSeatID = undefined;
    });
  }


}

module.exports = Mapcanvas;
