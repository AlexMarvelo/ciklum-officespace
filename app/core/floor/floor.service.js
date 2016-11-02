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


      this.floorServerRequest = () => {
        const floorID = this.floorID;
        return $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/floor/:floorID/:action`, {floorID: 'nomatter', action: 'getConfig'}, {
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


      this.seatServerRequest = (seatID) => {
        return $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/seat/:seatID/:action`, {seatID: 'nomatter', action: 'getSeat'}, {
          getSeat: {
            method: 'GET',
            params: {
              action: 'get'
            }
          },
          addSeat: {
            method: 'POST',
            params: {
              action: 'add'
            }
          },
          updateSeat: {
            method: 'POST',
            params: {
              seatID: seatID,
              action: 'update'
            }
          },
          getByFloor: {
            method: 'GET',
            params: {
              action: 'getbyfloor'
            }
          },
        });
      };




      // ---------------
      // Seats interface
      // ---------------


      this.getActiveSeat = () => {
        const floorID = this.floorID;
        try {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          return this.activeSeat;
        } catch (error) {
          Notifications.add(error);
        }
      };


      this.setActiveSeat = (activeSeat) => {
        const floorID = this.floorID;
        try {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!activeSeat) {
            if (this.activeSeat) $log.debug(`- unset active seat on ${floorID} floor`);
            this.activeSeat = undefined;
            return;
          }
          if (activeSeat.id == undefined) {
            throw { status: Notifications.codes.idRequired };
          }
          const targetSeat = this.floors[floorID].seats.find(seat => seat.id == activeSeat.id);
          if (!targetSeat) {
            throw { status: Notifications.codes.seatNotFound };
          }
          this.activeSeat = targetSeat;
          $log.debug(`- set active seat to ${this.activeSeat.id} on ${floorID} floor`);
        } catch (error) {
          Notifications.add(error);
        }
      };


      this.addSeat = (seat) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!seat.id) {
            throw { status: Notifications.codes.idRequired };
          }

          if (!this.floors[floorID]) this.floors[floorID] = Object.assign({}, initFloorState);
          this.seatServerRequest().addSeat({seatID: seat.id, seat}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[floorID].seats.push(seat);
            Notifications.add(Notifications.codes.success);
            $log.debug(`- add seat to ${floorID} floor with id: ${seat.id}`);
            resolve();
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.getSeats = () => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }

          if (!this.floors[floorID]) this.floors[floorID] = initFloorState;
          this.seatServerRequest().getByFloor({floorID}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[floorID].seats = response.seats;
            resolve(response.seats);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.updateSeatCoords = (seat) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!seat.id) {
            throw { status: Notifications.codes.idRequired };
          }
          let targetSeat = this.floors[floorID].seats.find(s => s.id == seat.id);
          if (!targetSeat) {
            throw { status: Notifications.codes.seatNotFound };
          }

          let updatedSeat = Object.assign({}, targetSeat);
          updatedSeat.x = seat.x;
          updatedSeat.y = seat.y;
          this.seatServerRequest(seat.id).updateSeat({seat: updatedSeat}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[floorID].seats = this.floors[floorID].seats.map(s => {
              if (s.id == seat.id) return updatedSeat;
              return s;
            });
            Notifications.add(Notifications.codes.success);
            $log.debug(`- update coords of seat ${seat.id} on ${floorID}`);
            resolve();
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };






      // this.get = () => {
      //   const floorID = this.floorID;
      //   if (!floorID) {
      //     Notifications.add(Notifications.codes.floorIDRequired);
      //     return;
      //   }
      //   return this.floors[floorID] || initFloorState;
      // };



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

          this.floorServerRequest().getConfig(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[floorID] = this.floors[floorID] || Object.assign({}, initFloorState);
            this.floors[floorID].config = response.config;
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

          this.floorServerRequest().setConfig({config: floor.config}).$promise
            .then(response => {
              if (response.status != Notifications.codes.success) {
                Notifications.add(response.status);
                if (CONFIG.consoleErrors) $log.error(response);
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
          this.floorServerRequest().getAllConfigs(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
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

          this.floorServerRequest().removeFloor(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            delete this.floors[floorID];
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
