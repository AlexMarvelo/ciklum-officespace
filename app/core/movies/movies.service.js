'use strict';

angular.
  module('core.movies').
  factory('Movies', ['$resource', '$log', 'User', 'CONFIG',
    function($resource, $log, User, CONFIG) {
      const defaultView = {
        currentPage: 1,
        Search: [],
        totalResults: 0
      };
      const getCurrentView = () => this.currentView;
      const setCurrentView = currentView => { this.currentView = currentView; };
      const resetCurrentView = () => { this.currentView = defaultView; };
      resetCurrentView();

      this.currentQuery = {};
      const getCurrentQuery = () => this.currentQuery;
      const setCurrentQuery = currentQuery => {this.currentQuery = currentQuery;};

      const serverRequest = $resource(`${CONFIG.appDomain}/search/`, {}, {
        query: {
          method: 'GET'
        }
      });

      const updateFavourites = () => {
        const favourites = User.getFavourites();
        this.currentView.Search.forEach(movie => {
          if (favourites.indexOf(movie.imdbID) != -1) {
            movie.isFavourite = true;
          }
        });
      };

      const addFavourite = movieID => {
        this.currentView.Search.find(movie => movie.imdbID == movieID).isFavourite = true;
      };

      const removeFavourite = movieID => {
        this.currentView.Search.find(movie => movie.imdbID == movieID).isFavourite = false;
      };

      const loadMovies = (qObj, targetPage = 1) => {
        if (qObj) this.currentQuery = qObj;
        $log.debug(`- execute search: s=${this.currentQuery.qstring}${this.currentQuery.qyear ? ', year=' + this.currentQuery.qyear : ''}${this.currentQuery.qtype ? ', type=' + this.currentQuery.qtype : ''}, page=${targetPage}`);
        serverRequest.query({
          s: this.currentQuery.qstring,
          y: this.currentQuery.qyear,
          type: this.currentQuery.qtype,
          page: targetPage
        }, (currentView) => {
          this.currentView = currentView;
          if (this.currentView.Response == 'True') {
            this.currentView.currentPage = targetPage;
            updateFavourites();
          } else {
            this.currentView.currentPage = 1;
            this.currentView.Search = [];
            this.currentView.totalResults = 0;
          }
        });
      };

      return {
        serverRequest,
        loadMovies,
        getCurrentView,
        setCurrentView,
        resetCurrentView,
        getCurrentQuery,
        setCurrentQuery,
        updateFavourites,
        addFavourite,
        removeFavourite
      };
    }
  ]);
