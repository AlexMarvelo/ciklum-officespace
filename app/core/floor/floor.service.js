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
          addConfig: {
            method: 'POST',
            params: {
              action: 'addconfig',
            }
          },
          updateConfig: {
            method: 'POST',
            params: {
              floorID: floorID,
              action: 'updateconfig',
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
          attachEmployee: {
            method: 'POST',
            params: {
              seatID: seatID,
              action: 'acttachemployee'
            }
          },
          removeSeat: {
            method: 'POST',
            params: {
              seatID: seatID,
              action: 'remove'
            }
          },
          getByFloor: {
            method: 'GET',
            params: {
              action: 'getbyfloor'
            }
          },
          getSeatByEmployee: {
            method: 'GET',
            params: {
              action: 'getbyemployee'
            }
          }
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


      this.getSeats = () => {
        const floorID = this.floorID;
        try {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }

          return this.floors[floorID] ? this.floors[floorID].seats : undefined;
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


      this.loadSeats = () => {
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


      this.updateSeatCoords = (seat = {}) => {
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


      this.updateSeat = (seatID, updatedSeat = {}) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!updatedSeat.id) {
            throw { status: Notifications.codes.idRequired };
          }
          let targerSeat = this.floors[floorID].seats.find(s => s.id == seatID);
          if (!targerSeat) {
            throw { status: Notifications.codes.seatNotFound };
          }

          this.seatServerRequest(seatID).updateSeat({seat: updatedSeat}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            if (updatedSeat.employeeID && updatedSeat.employeeID != targerSeat.employeeID) {
              this.unattachEmployeeFromAllSeats({id: updatedSeat.employeeID});
            }
            this.floors[floorID].seats = this.floors[floorID].seats.map(s => {
              if (s.id == seatID) return updatedSeat;
              return s;
            });
            Notifications.add(Notifications.codes.success);
            $log.debug(`- update seat ${seatID} on ${floorID}`);
            resolve();
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.unattachEmployeeFromAllSeats = (employee = {}) => {
        try {
          if (!employee.id) {
            throw { status: Notifications.codes.idRequired };
          }
          for (let fID in this.floors) {
            this.floors[fID].seats.forEach(seat => {
              if (seat.employeeID == employee.id) {
                seat.employeeID = undefined;
                $log.debug(`- unattach ${employee.id} from ${seat.id} seat on ${fID} floor`);
              }
            });
          }
        } catch (error) {
          Notifications.add(error.status);
        }
      };


      this.attachEmployeeToSeat = (seatID, employeeID) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!seatID) {
            throw { status: Notifications.codes.idRequired };
          }
          let targetSeat = this.floors[floorID].seats.find(s => s.id == seatID);
          if (!targetSeat) {
            throw { status: Notifications.codes.seatNotFound };
          }

          this.seatServerRequest(seatID).attachEmployee({employeeID}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[targetSeat.floorID].seats = this.floors[targetSeat.floorID].seats.map(seat => {
              if (seat.id == targetSeat.id) {
                seat.employeeID = employeeID;
              }
              return seat;
            });
            Notifications.add(Notifications.codes.success);
            $log.debug(employeeID ?
              `- attach ${employeeID} employee to ${seatID} seat on ${floorID} floor` :
              `- unattach employee from ${seatID} seat on ${floorID} floor`
            );
            resolve();
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.removeSeat = (seat = {}) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!seat.id) {
            throw { status: Notifications.codes.idRequired };
          }

          this.seatServerRequest(seat.id).removeSeat(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            if (this.activeSeat.id == seat.id) this.setActiveSeat(undefined);
            this.floors[floorID].seats = this.floors[floorID].seats.filter(s => s.id != seat.id);
            Notifications.add(Notifications.codes.success);
            $log.debug(`- remove seat ${seat.id} from floor ${floorID}`);
            resolve();
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.getSeatByEmployee = (employee = {}) => {
        const floorID = this.floorID;
        return new Promise((resolve) => {
          if (!floorID) {
            throw { status: Notifications.codes.floorIDRequired };
          }
          if (!employee.id) {
            throw { status: Notifications.codes.idRequired };
          }

          const seat = this.floors[floorID].seats.find(s => s.employeeID == employee.id);
          if (seat) {
            resolve(seat);
            return;
          }
          this.seatServerRequest().getSeatByEmployee({employeeID: employee.id}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            resolve(response.seat);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
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

          if (this.floors[floorID] && this.floors[floorID].config) {
            $log.debug(`- use cached floor config for ${floorID} floor`);
            resolve(this.floors[floorID].config);
            return;
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


      this.addConfig = (config) => {
        return new Promise((resolve) => {
          if (!config.id) {
            throw { status: Notifications.codes.idRequired };
          }
          for (let fID in this.floors) {
            if (fID == config.id) {
              throw { status: Notifications.codes.idUnique };
            }
          }

          let floor = Object.assign({}, initFloorState);
          floor.config = {
            id: config.id,
            title: config.title,
            mapSource: config.mapSource,
            width: config.width || defaultWidth,
          };
          this.floorServerRequest().addConfig({config: floor.config}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            this.floors[config.id] = floor;
            Notifications.add(Notifications.codes.success);
            $log.debug(`- set ${config.id} floor config`);
            resolve(response);
          });
        })
        .catch(error => {
          Notifications.add(error.status);
          throw error;
        });
      };


      this.updateConfig = (config) => {
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
          let floor;
          for (let fID in this.floors) {
            if (fID != floorID) continue;
            floor = Object.assign({}, this.floors[fID]);
          }
          if (!floor) {
            throw { status: Notifications.codes.floorNotFound };
          }

          floor.config = {
            id: config.id,
            title: config.title,
            mapSource: config.mapSource,
            width: config.width || defaultWidth,
          };
          this.floorServerRequest().updateConfig({config: floor.config}, response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            if (config.id != floorID) delete this.floors[config.id];
            this.floors[config.id] = floor;
            Notifications.add(Notifications.codes.success);
            $log.debug(`- update ${floorID} floor config`);
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
          if (Object.keys(this.floors).length) {
            let configs = [];
            for (let fID in this.floors) {
              configs.push(this.floors[fID].config);
            }
            $log.debug('- use cahced floor configs list');
            resolve(configs);
            return;
          }

          this.floorServerRequest().getAllConfigs(response => {
            if (response.status != Notifications.codes.success) {
              Notifications.add(response.status);
              if (CONFIG.consoleErrors) $log.error(response);
              return;
            }
            response.configs.forEach(config => {
              this.floors[config.id] = this.floors[config.id] || Object.assign({}, initFloorState);
              this.floors[config.id].config = config;
            });
            console.dir(this.floors);
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

          // seats interface:
          getSeats: this.getSeats,
          loadSeats: this.loadSeats,
          getSeatByEmployee: this.getSeatByEmployee,
          attachEmployeeToSeat: this.attachEmployeeToSeat,
          addSeat: this.addSeat,
          removeSeat: this.removeSeat,
          updateSeat: this.updateSeat,
          updateSeatCoords: this.updateSeatCoords,
          getActiveSeat: this.getActiveSeat,
          setActiveSeat: this.setActiveSeat,

          // config interface:
          getConfig: this.getConfig,
          getAllConfigs: this.getAllConfigs,
          addConfig: this.addConfig,
          updateConfig: this.updateConfig,
          removeFloor: this.removeFloor,
        };
      };
    }
  ]);
