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
      'activeSeat',
      (activeSeat = {id: undefined}) => {
        this.seats.forEach(seat => {
          if (seat.id == activeSeat.id) {
            seat.x = activeSeat.x;
            seat.y = activeSeat.y;
            const updatedSeat = {
              id: seat.id,
              x: seat.x,
              y: seat.y,
            };
            this.Floor(this.floorID).updateSeatCoords(updatedSeat);
            this.Floor(this.floorID).setActiveSeat(updatedSeat);
          } else {
            seat.deactivate();
          }
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


  isPlaceFree(coords = {x:0, y:0}) {
    return this.seats.find(seat => {
      return Math.abs(seat.x - coords.x) < this.config.blockAreaRadius &&
             Math.abs(seat.y - coords.y) < this.config.blockAreaRadius;
    }) == undefined;
  }


  drawMapCanvas(containerID, containerWidth, containerHeight) {
    this.draw = SVG(containerID).size(containerWidth, containerHeight).addClass('mapcanvas-canvas');
    this.group = this.draw.group();
    this.config.width = containerWidth;
    this.config.height = containerHeight;

    this.draw.click(event => {
      event.preventDefault();
      const emptyPlaceClicked = event.target.id == this.draw.node.id;
      if (emptyPlaceClicked && this.User.authorized() && this.userMode == 'draw') this.addSeat({x: event.offsetX, y: event.offsetY});
    });
  }


  addSeat(coords = {x:0, y:0}, seatID = (new Date()).toISOString(), title, employeeID) {
    if (!this.isPlaceFree(coords)) {
      this.$scope.$apply(() => {
        this.Notifications.add(this.Notifications.codes.tooCloseSeat);
      });
      return;
    }

    let seat = new Seat(
      {
        draw: this.draw,
        $scope: this.$scope,
        width: this.config.width,
        height: this.config.height,
      },
      coords,
      seatID,
      title,
      employeeID
    );
    this.seats.push(seat);
    this.group.add(seat.svg);
    this.Floor(this.floorID).addSeat({
      id: seat.id,
      x: seat.x,
      y: seat.y,
      employeeID: seat.employeeID,
      title: seat.title,
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
        {
          draw: this.draw,
          $scope: this.$scope,
          width: this.config.width,
          height: this.config.height,
        }, {
          x: seat.x,
          y: seat.y
        },
        seat.id,
        seat.title,
        seat.employeeID
      ));
    });
  }


  deactivateAllSeats() {
    this.seats.forEach(seat => seat.deactivate());
    this.$scope.$apply(() => {
      this.$scope.activeSeat = undefined;
    });
  }


  activateOneSeat(seat) {
    this.seats.forEach(s => {
      if (s.id == seat.id) {
        s.activate();
      } else {
        s.deactivate();
      }
    });
  }


}

module.exports = Mapcanvas;
