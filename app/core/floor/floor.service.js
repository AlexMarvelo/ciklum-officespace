'use strict';

angular.
  module('core.floor').
  factory('Floor', ['$log', '$resource', 'localStorageService', 'Notifications', 'CONFIG',
    function($log, $resource,localStorageService,  Notifications, CONFIG) {
      this.floors = localStorageService.get('floors') || {};
      const initFloorState = {
        seats: [],
      };
      const defaultWidth = 945;


      const serverRequest = $resource(`${CONFIG.env == 'production' ? CONFIG.appDomain_remote : CONFIG.appDomain_local}/employees/:action`, {action: 'get'}, {
        get: {
          method: 'GET',
          params: {
            action: 'get'
          }
        }
      });


      const get = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        return this.floors[floorID] || initFloorState;
      };


      const getSeats = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!this.floors[floorID]) this.floors[floorID] = initFloorState;
        return this.floors[floorID].seats;
      };


      const addSeat = (seat) => {
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
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- add seat to ${floorID} floor with id: ${seat.id}`);
      };


      const updateSeat = (seatID, newSeat = {}) => {
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
          unattachEmployeeFromAllSeats({id: newSeat.employeeID});
        }
        this.floors[floorID].seats.splice(seatIndex, 1, newSeat);
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- update seat ${seatID} on ${floorID}`);
      };


      const updateSeatCoords = (seat) => {
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
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- update coords of seat ${seat.id} on ${floorID}`);
      };


      const unattachEmployeeFromAllSeats = (employee) => {
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


      const removeSeat = (seat = {}) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (seat.id == undefined) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        if (this.activeSeat.id == seat.id) setActiveSeat(undefined);
        this.floors[floorID].seats = this.floors[floorID].seats.filter(s => s.id != seat.id);
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- remove seat ${seat.id} from floor ${floorID}`);
      };


      const cleanSeats = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!this.floors[floorID]) return;
        this.floors[floorID].seats = [];
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- clean all seats om ${floorID} floor`);
      };


      const getActiveSeat = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        return this.activeSeat;
      };


      const setActiveSeat = (activeSeat) => {
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


      const getConfig = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        let floor = this.floors[floorID];
        if (!floor) floor = Object.assign({}, initFloorState);
        if (!floor.config) return { mapSrc: '', width: defaultWidth };
        return {
          id: floor.config.id || '',
          title: floor.config.title || '',
          mapSrc: floor.config.mapSrc || '',
          width: floor.config.width || defaultWidth,
        };
      };


      const setConfig = (config) => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!config.id) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        if (!config.id.length) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        for (let fID in this.floors) {
          if (fID == config.id && fID != floorID) {
            Notifications.add(Notifications.codes.idUnique);
            return;
          }
        }
        let floor;
        if (!this.floors[floorID]) {
          floor = this.floors[config.id] = Object.assign({}, initFloorState);
        } else if (floorID != config.id) {
          floor = this.floors[config.id] = Object.assign({}, this.floors[floorID]);
          delete this.floors[floorID];
        } else {
          floor = this.floors[floorID];
        }
        if (!floor.config) floor.config = {};
        floor.config.id = config.id;
        floor.config.title = config.title;
        floor.config.mapSrc = config.mapSrc;
        floor.config.width = config.width || defaultWidth;
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- set/update ${floorID} floor config`);
      };


      const getAllConfigs = () => {
        let result = [];
        for (let floorID in this.floors) {
          let config = Object.assign({}, this.floors[floorID].config);
          config.id = floorID;
          result.push(config);
        }
        return result;
      };


      const removeFloor = () => {
        const floorID = this.floorID;
        if (!floorID) {
          Notifications.add(Notifications.codes.floorIDRequired);
          return;
        }
        if (!floorID) {
          Notifications.add(Notifications.codes.idRequired);
          return;
        }
        delete this.floors[floorID];
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(`- remove ${floorID} floor`);
      };


      const getSeatByEmployee = (employee) => {
        const floorID = this.floorID;
        const seat = this.floors[floorID].seats.find(s => s.employeeID == employee.id);
        if (seat) return seat;
        for (let fID in this.floors) {
          if (fID == floorID) continue;
          let seat = this.floors[fID].seats.find(s => s.employeeID == employee.id);
          if (seat) return seat;
        }
      };


      const attachEmployeeToSeat = (seatID, employeeID) => {
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
          unattachEmployeeFromAllSeats({id: employeeID});
        }
        seat.employeeID = employeeID;
        localStorageService.set('floors', this.floors);
        Notifications.add(Notifications.codes.success);
        $log.debug(employeeID ?
          `- attach ${employeeID} employee to ${seatID} seat` :
          `- unattach employee from ${seatID} seat`
        );
      };


      return (floorID) => {
        this.floorID = floorID;
        return {
          get,
          getSeats,
          getSeatByEmployee,
          attachEmployeeToSeat,
          addSeat,
          removeSeat,
          updateSeat,
          updateSeatCoords,
          cleanSeats,
          getActiveSeat,
          setActiveSeat,
          serverRequest,
          getConfig,
          setConfig,
          getAllConfigs,
          removeFloor,
        };
      };
    }
  ]);
