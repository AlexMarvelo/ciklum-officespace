'use strict';

angular.
  module('core.floor').
  factory('Floor', ['$log', '$resource', 'localStorageService', 'Notifications', 'CONFIG',
    function($log, $resource,localStorageService,  Notifications, CONFIG) {
      this.floors = localStorageService.get('floors') || {};
      const initFloorState = {
        seats: [],
      };


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


      const removeSeat = (seat = {id: undefined}) => {
        const floorID = this.floorID;
        if (this.activeSeat.id == seat.id) setActiveSeatID(undefined);
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


      const setActiveSeatID = (seatID) => {
        if (seatID) {
          this.activeSeat = this.floors[this.floorID].seats.find(seat => seat.id == seatID);
          $log.debug(`- set active seat to ${this.activeSeat.id} on the floor ${this.floorID}`);
        } else {
          if (this.activeSeat) $log.debug(`- unset active seat on the floor ${this.floorID}`);
          this.activeSeat = undefined;
        }
      };


      return (floorID = 'floor19') => {
        this.floorID = floorID;
        return {
          get,
          getSeats,
          addSeat,
          removeSeat,
          cleanSeats,
          getActiveSeat,
          setActiveSeatID,
          serverRequest
        };
      };
    }
  ]);
