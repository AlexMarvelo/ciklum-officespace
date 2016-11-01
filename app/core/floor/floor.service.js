'use strict';

angular.
  module('core.floor').
  factory('Floor', ['$log', '$resource', 'localStorageService', 'Notifications', 'CONFIG',
    function($log, $resource,localStorageService,  Notifications, CONFIG) {
      this.floors = {};
      const initFloorState = {
        seats: [],
      };
      const defaultWidth = 945;


      // -----------
      // floor utils
      // -----------


      this.serverRequest = () => {
        const floorID = this.floorID;
        return $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/floor/:floorID/:action`, {action: 'getConfig'}, {
          getConfig: {
            method: 'GET',
            params: {
              floorID: floorID,
              action: 'getconfig',
            }
          },
          setConfig: {
            method: 'POST',
            params: {
              floorID: floorID,
              action: 'setconfig',
            }
          },
          getAllConfigs: {
            method: 'GET',
            params: {
              floorID: floorID,
              action: 'getallconfigs'
            }
          },
          removeFloor: {
            method: 'POST',
            params: {
              floorID: floorID,
              action: 'remove'
            }
          },
        });
      };


      this.get = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        return this.floors[floorID] || initFloorState;
      };


      this.getSeats = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!this.floors[floorID]) this.floors[floorID] = initFloorState;
        return this.floors[floorID].seats;
      };


      this.addSeat = (seat) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (seat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        if (!this.floors[floorID]) this.floors[floorID] = Object.assign({}, initFloorState);
        this.floors[floorID].seats.push(seat);
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- add seat to ${floorID} floor with id: ${seat.id}`);
      };


      this.updateSeat = (seatID, newSeat = {}) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (newSeat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        let seat = this.floors[floorID].seats.find(s => s.id == seatID);
        if (!seat) {
          Notifications.add(Notifications.codes.seatNotFound);
          return;
        }
        let seatIndex = this.floors[floorID].seats.indexOf(seat);
        if (newSeat.employeeID && seat.employeeID != newSeat.employeeID) {
          this.unattachEmployeeFromAllSeats({id: newSeat.employeeID});
        }
        this.floors[floorID].seats.splice(seatIndex, 1, newSeat);
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- update seat ${seatID} on ${floorID}`);
      };


      this.updateSeatCoords = (seat) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (seat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        let targetSeat = this.floors[floorID].seats.find(s => s.id == seat.id);
        if (!targetSeat) {
          Notifications.add(Notifications.codes.seatNotFound);
          return;
        }
        targetSeat.x = seat.x;
        targetSeat.y = seat.y;
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- update coords of seat ${seat.id} on ${floorID}`);
      };


      this.unattachEmployeeFromAllSeats = (employee) => {
        if (!employee.id) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        for (let floorID in this.floors) {
          this.floors[floorID].seats.forEach(seat => {
            if (seat.employeeID == employee.id) {
              seat.employeeID = undefined;
              $log.debug(`- unattach ${employee.id} from ${seat.id} seat on ${floorID} floor`);
            }
          });
        }
      };


      this.removeSeat = (seat = {}) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (seat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        if (this.activeSeat.id == seat.id) this.setActiveSeat(undefined);
        this.floors[floorID].seats = this.floors[floorID].seats.filter(s => s.id != seat.id);
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- remove seat ${seat.id} from floor ${floorID}`);
      };


      this.cleanSeats = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!this.floors[floorID]) return;
        this.floors[floorID].seats = [];
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- clean all seats om ${floorID} floor`);
      };


      this.getActiveSeat = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        return this.activeSeat;
      };


      this.setActiveSeat = (activeSeat) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!activeSeat) {
          if (this.activeSeat) $log.debug(`- unset active seat on ${floorID} floor`);
          this.activeSeat = undefined;
          return;
        }
        if (activeSeat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        const targetSeat = this.floors[floorID].seats.find(seat => seat.id == activeSeat.id);
        if (!targetSeat) {
          Notifications.add(Notifications.codes.seatNotFound);
          return;
        }
        this.activeSeat = targetSeat;
        $log.debug(`- set active seat to ${this.activeSeat.id} on ${floorID} floor`);
      };


      this.getSeatByEmployee = (employee) => {
        const floorID = this.floorID;
        const seat = this.floors[floorID].seats.find(s => s.employeeID == employee.id);
        if (seat) return seat;
        for (let fID in this.floors) {
          if (fID == floorID) continue;
          let seat = this.floors[fID].seats.find(s => s.employeeID == employee.id);
          if (seat) return seat;
        }
      };


      this.attachEmployeeToSeat = (seatID, employeeID) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        let seat = this.floors[floorID].seats.find(s => s.id == seatID);
        if (!seat) {
          Notifications.add(Notifications.codes.seatNotFound);
          return;
        }
        if (employeeID) {
          this.unattachEmployeeFromAllSeats({id: employeeID});
        }
        seat.employeeID = employeeID;
        // localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(employeeID ?
          `- attach ${employeeID} employee to ${seatID} seat` :
          `- unattach employee from ${seatID} seat`
        );
      };




      // ----------------------
      // floor config interface
      // ----------------------


      this.getConfig = () => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }

          this.serverRequest().getConfig(response => {
            if (response.status != Notifications.codes.success) {
              throw response;
            }
            resolve(response.config);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.setConfig = (config) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!config.id) {
            throw { status: Notifications.codes.idRequired };
          }
          for (let fID in this.floors) {
            if (fID == config.id && fID != floorID) {
              throw { status: Notifications.codes.idUnique };
            }
          }

          let floor = this.floors[floorID] ? Object.assign({}, this.floors[floorID]) : Object.assign({}, initFloorState);
          floor.config = floor.config || {};
          floor.config.id = config.id;
          floor.config.title = config.title;
          floor.config.mapSource = config.mapSource;
          floor.config.width = config.width || defaultWidth;

          this.serverRequest().setConfig({config: floor.config}).$promise
            .then(response => {
              if (response.status != Notifications.codes.success) {
                Notifications.add(response.status);
                return;
              }
              this.floors[config.id] = floor;
              Notifications.add(Notifications.codes.success);
              $log.debug(`- set/update ${floorID} floor config`);
              resolve(response);
            });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.getAllConfigs = () => {
        return new Promise((resolve) => {
          this.serverRequest().getAllConfigs(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              return;
            }
            resolve(response.configs);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.removeFloor = () => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.idRequired };
          }

          this.serverRequest().removeFloor(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              return;
            }
            Notifications.add(Notifications.codes.success);
            $log.debug(`- remove ${floorID} floor`);
            resolve(response);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };




      return (floorID) => {
        this.floorID = floorID;
        return {
          serverRequest: this.serverRequest,

          get: this.get,
          getSeats: this.getSeats,
          getSeatByEmployee: this.getSeatByEmployee,
          attachEmployeeToSeat: this.attachEmployeeToSeat,
          addSeat: this.addSeat,
          removeSeat: this.removeSeat,
          updateSeat: this.updateSeat,
          updateSeatCoords: this.updateSeatCoords,
          cleanSeats: this.cleanSeats,
          getActiveSeat: this.getActiveSeat,
          setActiveSeat: this.setActiveSeat,

          // config interface:
          getConfig: this.getConfig,
          getAllConfigs: this.getAllConfigs,
          setConfig: this.setConfig,
          removeFloor: this.removeFloor,
        };
      };
    }
  ]);
