'use strict';

angular.
  module('movieDetails').
  component('movieDetails', {
    controller: ['$scope', '$log', '$stateParams', 'Movie', 'Movies', 'User', 'Comments', 'Notifications',
      function MovieDetailsCtrl($scope, $log, $stateParams, Movie, Movies, User, Comments, Notifications) {
        this.staticText = {
          tableHeader: 'Movie details',
        };
        this.tableDetails = {};

        this.$onInit = () => {
          Movie.serverRequest.get({movieID: $stateParams.movieID}, (res) => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              res.isFound = false;
              return;
            }
            let movie = res;
            this.movie = movie;
            this.movie.isFound = true;
            this.movie.comments = movie.comments || [];
            this.movie.comments.forEach(comment => {
              comment.timestampString = this.getTimestampString(new Date(comment.timestamp));
              comment.removeable = comment.userID == User.get().local.email;
            });
            this.movie.isFavourite = User.getFavourites().indexOf(movie.imdbID) != -1;
            const tableFields = ['Year', 'Released', 'Runtime', 'Genre', 'Writer', 'Actors', 'Language', 'Country', 'Awards', 'imdbRating', 'imdbVotes', 'Type'];
            tableFields.forEach(key => {
              if (!movie.hasOwnProperty(key) ||
                  movie[key] === 'N/A') return;
              this.tableDetails[key] = movie[key];
            });
          });
        };

        this.getTimestampString = timestamp =>
          `${timestamp.getDate()<10?'0':''}${timestamp.getDate()}.${timestamp.getMonth()+1<10?'0':''}${timestamp.getMonth()+1} ` +
          `${!timestamp.getHours()<10?'0':''}${timestamp.getHours()}:${timestamp.getMinutes()<10?'0':''}${timestamp.getMinutes()}`;


        //
        // comments handling
        //

        this.onCommentFormSubmit = (event) => {
          event.preventDefault();
          if (!this.commentText || !this.commentText.length) return;
          let now = new Date();
          let comment = {
            movieID: this.movie.imdbID,
            text: this.commentText,
            timestamp: now,
            userID: User.get().local.email,
            timestampString: this.getTimestampString(now)
          };
          this.addComment(comment);
          this.commentText = '';
        };

        this.addComment = (comment) => {
          $log.debug(`- add comment for ${comment.movieID} from ${User.get().local.email}`);
          Comments.serverRequest.add(comment, res => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              $log.error(res);
            }
          });
          comment.removeable = true;
          this.movie.comments.push(comment);
        };

        this.onRemoveCommentClick = (event, comment) => {
          event.preventDefault();
          if (comment.userID != User.get().local.email) return;
          this.removeComment(comment);
        };

        this.removeComment = (comment) => {
          $log.debug(`- remove comment for ${comment.movieID} from ${User.get().local.email}`);
          Comments.serverRequest.remove(comment, res => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              $log.error(res);
            }
          });
          this.movie.comments = this.movie.comments.filter(c =>
            c.timestamp != comment.timestamp || c.userID != comment.userID
          );
        };


        //
        // favourites handling
        //

        this.toggleFavourite = (event) => {
          event.preventDefault();
          if (this.movie.isFavourite) {
            this.removeMovieFromFavourites();
          } else {
            this.addMovieToFavourites();
          }
        };


        this.addMovieToFavourites = () => {
          let movie = this.movie;
          movie.isFavourite = true;
          User.addFavourite(movie.imdbID);
          Movies.addFavourite(movie.imdbID);
          Movie.serverRequest.addToFavs({ movieID: movie.imdbID }, (res) => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              movie.isFavourite = !movie.isFavourite;
              User.removeFavourite(movie.imdbID);
              Movies.removeFavourite(movie.imdbID);
              $log.error(res);
            }
          });
        };

        this.removeMovieFromFavourites = () => {
          let movie = this.movie;
          movie.isFavourite = false;
          User.removeFavourite(movie.imdbID);
          Movies.removeFavourite(movie.imdbID);
          Movie.serverRequest.removeFromFavs({ movieID: movie.imdbID }, (res) => {
            Notifications.add(res.status);
            if (res.status != Notifications.codes.success) {
              movie.isFavourite = !movie.isFavourite;
              User.addFavourite(movie.imdbID);
              Movies.addFavourite(movie.imdbID);
              $log.error(res);
            }
          });
        };
      }
    ],

    template: `
      <div class="container" ng-if="$ctrl.movie.isFound">
        <div class="row">
          <div class="col-sm-4 text-center">
            <img ng-src="{{$ctrl.movie.Poster !== 'N/A' ? $ctrl.movie.Poster : 'http://placehold.it/280x390'}}" class="movie-poster" alt="{{$ctrl.movie.Title}}">
            <div class="btn-container">
              <button class="btn btn-default btn-favourite {{$ctrl.movie.isFavourite ? 'active' : ''}}" ng-click="$ctrl.toggleFavourite($event)" type="button">
                <span class="glyphicon glyphicon-star" aria-hidden="true"></span>
                <span class="btn-favourite-text btn-favourite-text-add">Add to favourites</span>
                <span class="btn-favourite-text btn-favourite-text-remove">Remove from favourites</span>
              </button>
            </div>
          </div>

          <div class="col-sm-8">
            <a ui-sref="home"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back</a>

            <div class="page-header">
              <h1 class="text-left">
                {{$ctrl.movie.Title}} <small>{{ $ctrl.movie.Director !== 'N/A' ? 'directed by ' + $ctrl.movie.Director : ''}}</small>
              </h1>
            </div>

            <div class="panel panel-default">
              <div class="panel-heading"><h4>{{$ctrl.staticText.tableHeader}}</h4></div>
              <table class="table">
                <tbody>
                  <tr ng-repeat="(key, value) in $ctrl.tableDetails">
                    <th scope="row">{{key}}</th>
                    <td>{{value}}</td>
                  </tr>
                </tbody>
              </table>
              <div class="panel-body">
                <p>{{$ctrl.movie.Plot}}</p>
              </div>
            </div>

            <div class="panel panel-default">
              <div class="panel-heading"><h4>Comments</h4></div>
              <div class="panel-body">
                <ul class="media-list">
                  {{!$ctrl.movie.comments.length ? 'No comments yet' : ''}}
                  <li class="media comment" ng-repeat="comment in $ctrl.movie.comments">
                    <div class="media-left">
                      <a href="#">
                        <img class="media-object" alt="64x64" data-src="holder.js/64x64" style="width: 64px; height: 64px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PCEtLQpTb3VyY2UgVVJMOiBob2xkZXIuanMvNjR4NjQKQ3JlYXRlZCB3aXRoIEhvbGRlci5qcyAyLjYuMC4KTGVhcm4gbW9yZSBhdCBodHRwOi8vaG9sZGVyanMuY29tCihjKSAyMDEyLTIwMTUgSXZhbiBNYWxvcGluc2t5IC0gaHR0cDovL2ltc2t5LmNvCi0tPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PCFbQ0RBVEFbI2hvbGRlcl8xNTdlNmI1ODYyZSB0ZXh0IHsgZmlsbDojQUFBQUFBO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQgfSBdXT48L3N0eWxlPjwvZGVmcz48ZyBpZD0iaG9sZGVyXzE1N2U2YjU4NjJlIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSIxMy40Njg3NSIgeT0iMzYuNSI+NjR4NjQ8L3RleHQ+PC9nPjwvZz48L3N2Zz4=" data-holder-rendered="true">
                      </a>
                    </div>
                    <div class="media-body comment-body">
                      <span class="comment-timestamp">{{comment.timestampString}}</span>
                      <span ng-if="comment.removeable" class="glyphicon glyphicon-remove comment-remove" aria-hidden="true" ng-click="$ctrl.onRemoveCommentClick($event, comment)"></span>
                      <h6 class="media-heading comment-heading">{{comment.userID}}</h6>
                      <p class="comment-text">{{comment.text}}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="panel-footer">
                <form action="comment/add" method="POST" class="comment-form" autocomplete="off" ng-submit="$ctrl.onCommentFormSubmit($event)">
                <div class="row">
                  <div class="col-lg-9 col-sm-8">
                    <textarea class="form-control comment-textarea" rows="3" ng-model="$ctrl.commentText"></textarea>
                  </div>
                  <div class="col-lg-3 col-sm-4 text-right">
                    <button type="submit" class="btn btn-default comment-btn">Leave comment</button>
                  </div>
                </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    `,
  });
