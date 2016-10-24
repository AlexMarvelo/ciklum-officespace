angular.
  module('moviesBlock').
  component('moviesBlock', {
    controller: ['$scope', '$log', 'Movies', 'Movie', 'User', 'Notifications', 'CONFIG',
      function MoviesBlockCtrl($scope, $log, Movies, Movie, User, Notifications, CONFIG) {
        this.currentView = {
          totalResults: 0,
          currentPage: 1,
          Search: []
        };

        $scope.$watch(
          Movies.getCurrentView,
          (newView) => {
            let isNewRequest = Movies.getCurrentView().Search.length == 0;
            this.currentView = newView;
            if (isNewRequest) Notifications.add(this.currentView.status);
            if (this.currentView.status == Notifications.codes.success) {
              if (this.currentView.remoteSourse == true) Notifications.add(Notifications.codes.remoteSourse);
            }
            this.setPagination();
          }
        );

        this.setPagination = () => {
          this.pagination = [];
          let totalPages = Math.ceil(this.currentView.totalResults / CONFIG.moviesPerPage);
          let currentPage = this.currentView.currentPage;
          if (totalPages <= 1) return;
          for(let i = 0; i < totalPages; i++) {
            if (Math.abs(i - 1) > 4 &&
                Math.abs(i - currentPage) > 4 &&
                Math.abs(i - totalPages) > 4) continue;
            this.pagination.push({
              name: i+1,
              number: i+1,
              link: '#',
              active: currentPage === i+1
            });
          }
        };

        this.onPaginationClick = (event, page) => {
          event.preventDefault();
          if (!page) return;
          Movies.loadMovies(null, page.number);
        };

        this.toggleFavourite = (event, movie) => {
          event.preventDefault();
          if (!movie) return;
          if (movie.isFavourite) {
            this.removeMovieFromFavourites(movie);
          } else {
            this.addMovieToFavourites(movie);
          }
        };

        this.addMovieToFavourites = (movie) => {
          movie.isFavourite = true;
          User.addFavourite(movie.imdbID);
          Movie.serverRequest.addToFavs({ movieID: movie.imdbID }, (res) => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              movie.isFavourite = false;
              User.removeFavourite(movie.imdbID);
              return;
            }
          });
        };

        this.removeMovieFromFavourites = (movie) => {
          movie.isFavourite = false;
          User.removeFavourite(movie.imdbID);
          Movie.serverRequest.removeFromFavs({ movieID: movie.imdbID }, (res) => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              movie.isFavourite = true;
              User.addFavourite(movie.imdbID);
              return;
            }
          });
        };
      }
    ],

    template: `
      <search-block></search-block>

      <div class="container">

        <div class="row text-center">
          <div ng-repeat="movie in $ctrl.currentView.Search" class="movie-card col-sm-6 col-md-4 col-lg-3">
            <div class="thumbnail {{movie.isFavourite ? 'thumbnail-favourite' : ''}}" data-id="{{movie.imdbID}}">
              <a ui-sref="movieDetails({movieID: movie.imdbID})">
                <img class="movie-poster" ng-src="{{movie.Poster !== 'N/A' ? movie.Poster : 'http://placehold.it/280x390'}}" alt="{{movie.Title}}">
              </a>
              <div class="caption">
                <a ui-sref="movieDetails({movieID: movie.imdbID})">
                  <h3>{{movie.Title}}</h3>
                </a>
                <span class="badge">{{movie.Year}}</span>
                <span class="badge">{{movie.Type}}</span>
                <div>
                  <button class="btn btn-default btn-favourite" type="button" ng-click="$ctrl.toggleFavourite($event, movie)">
                    <span class="glyphicon glyphicon-star" aria-hidden="true"></span>
                    <span class="btn-favourite-text btn-favourite-text-add">Add to favourites</span>
                    <span class="btn-favourite-text btn-favourite-text-remove">Remove from favourites</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav class="text-center" aria-label="Page navigation">
          <ul class="pagination" ng-click="$ctrl.onPaginationClick($event)">
            <li ng-repeat="page in $ctrl.pagination" class="{{page.active ? 'active' : ''}}">
              <a href="#" ng-click="$ctrl.onPaginationClick($event, page)">{{page.name}}</a>
            </li>
          </ul>
        </nav>

      </div>
    `,
  });
