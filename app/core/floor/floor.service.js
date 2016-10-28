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
        return this.floors[floorID] || initFloorState;
      };


      const getSeats = () => {
        const floorID = this.floorID;
        if (!this.floors[floorID]) this.floors[floorID] = initFloorState;
        return this.floors[floorID].seats;
      };


      const addSeat = (seat) => {
        const floorID = this.floorID;
        if (!this.floors[floorID]) this.floors[floorID] = initFloorState;
        this.floors[floorID].seats.push(seat);
        $log.debug(`- add seat to ${floorID} floor with id: ${seat.id}`);
        localStorageService.set('floors', this.floors);
      };


      const updateSeat = (seatID, newSeat) => {
        const floorID = this.floorID;
        let seat = this.floors[floorID].seats.find(s => s.id == seatID);
        if (seat) {
          let seatIndex = this.floors[floorID].seats.indexOf(seat);
          this.floors[floorID].seats.splice(seatIndex, 1, newSeat);
          localStorageService.set('floors', this.floors);
          $log.debug(`- update seat ${seatID} on ${floorID}`);
        } else {
          $log.error(`- cant\'t update: seat ${seatID} not found on floor ${floorID}`);
        }
      };


      const removeSeat = (seat = {id: undefined}) => {
        const floorID = this.floorID;
        if (this.activeSeat.id == seat.id) setActiveSeat(undefined);
        this.floors[floorID].seats = this.floors[floorID].seats.filter(s => s.id != seat.id);
        if (seat.id) $log.debug(`- remove seat ${seat.id} from floor ${floorID}`);
        localStorageService.set('floors', this.floors);
      };


      const cleanSeats = () => {
        const floorID = this.floorID;
        if (!this.floors[floorID]) return;
        this.floors[floorID].seats = [];
        localStorageService.set('floors', this.floors);
      };


      const getActiveSeat = () => this.activeSeat;


      const setActiveSeat = (activeSeat) => {
        const floorID = this.floorID;
        if (activeSeat && activeSeat.id != undefined) {
          this.activeSeat = this.floors[floorID].seats.find(seat => seat.id == activeSeat.id);
          $log.debug(`- set active seat to ${this.activeSeat.id} on the floor ${floorID}`);
        } else {
          if (this.activeSeat) $log.debug(`- unset active seat on the floor ${floorID}`);
          this.activeSeat = undefined;
        }
      };


      const getConfig = () => {
        const floorID = this.floorID;
        const floor = this.floors[floorID];
        if (!floor.config) return { mapSrc: '', width: defaultWidth };
        return {
          mapSrc: floor.config.mapSrc || '',
          width: floor.config.width || defaultWidth,
        };
      };

      const setConfig = (config) => {
        const floorID = this.floorID;
        let floor = this.floors[floorID];
        if (!floor.config) floor.config = { mapSrc: '', width: defaultWidth };
        floor.config.mapSrc = config.mapSrc || floor.config.mapSrc;
        floor.config.width = config.width || floor.config.width;
        localStorageService.set('floors', this.floors);
      };


      return (floorID = 'floor19') => {
        this.floorID = floorID;
        return {
          get,
          getSeats,
          addSeat,
          removeSeat,
          updateSeat,
          cleanSeats,
          getActiveSeat,
          setActiveSeat,
          serverRequest,
          getConfig,
          setConfig,
        };
      };
    }
  ]);
