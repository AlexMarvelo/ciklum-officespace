'use strict';

const fetch = require('node-fetch');
const OMDbURL = require('../config/app.config.json').remoteBaseURL;
const dbConnection = require('../db/db')().getDBconnection();
const Movie = require('../models/movie');
const User = require('../models/user');
const Comment = require('../models/comment');
const itemsPerPage = 10;
const utils = {};

let props = {
  pageTitle: 'OMDb Hero'
};


utils.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(`- private route requested. access allowed. user: ${req.user.local.email}`);
    return next();
  }
  console.log('- private aren\'t available for unauthorized users. access denied');
  res.redirect('/login');
};


utils.isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('- login/signup route requested. access allowed');
    return next();
  }
  console.log('- login/signup aren\'t available for authorized users. access denied');
  res.redirect('/');
};



utils.renderApp = (res) => {
  res.render('index', props);
};


utils.getMovieByID = (id) => {
  return utils.getRequestedDataFromOMDb(`/?i=${id}`);
};


utils.loadCommentsToMovie = (movie) => {
  let qObj = {
    movieID: movie.imdbID,
  };
  return Comment.find(qObj).sort({timestamp: 1}).exec()
    .then(comments => {
      movie.comments = comments;
      return movie;
    });
};


utils.getSearchRequestData = (qObj) => {
  if (!dbConnection.readyState) return utils.getRequestedDataFromOMDb(`/${utils.getQString(qObj)}`);

  let dbQuery = {
    Title: new RegExp(`.*${qObj.s}.*`, 'i')
  };
  if (qObj.y) dbQuery.Year = qObj.y;
  if (qObj.type) dbQuery.Type = qObj.type;
  let page = qObj.page || 1;
  return Movie.find(dbQuery).exec()
    .then(movies => {
      if (!movies.length) {
        return utils.getRequestedDataFromOMDb(`/${utils.getQString(qObj)}`);
      }
      return {
        Search: movies.slice((page-1)*itemsPerPage, page*itemsPerPage),
        totalResults: movies.length,
        Response: 'True'
      };
    });
};


utils.getQString = (qObj) => {
  let qString = '?';
  for (let prop in qObj) {
    qString += `${prop}=${qObj[prop]}&`;
  }
  qString = qString.slice(0, -1).replace(' ', '+');
  return qString;
};


utils.getRequestedDataFromOMDb = (query) => {
  return fetch(OMDbURL + query)
    .then(res => res.text())
    .then(JSON.parse)
    .then(data => {
      data.remoteSourse = true;
      return data;
    });
};


utils.addFavToUser = (req, res, user, movieID) => {
  console.log(`- add ${movieID} to favs of ${user.local.email}`);
  User.findOne({ 'local.email' :  user.local.email }, (error, user) => {

    // if there are any errors, return the error
    if (error) {
      error.status = 500;
      res.send(error);
      throw error;
    }

    // check to see if theres already a user with that email
    if (!user) {
      res.send({ status: 400, message: 'No such user was found' });
      throw new Error('No such user was found');
    }

    user.favourites.push(movieID);
    user.save()
      .then(() => { res.send({ status: 200 }); })
      .catch(error => {
        error.status = 500;
        res.send(error);
        throw error;
      });
  });
};


utils.removeFavFromUser = (req, res, user, movieID) => {
  console.log(`- remove ${movieID} from favs of ${user.local.email}`);
  User.findOne({ 'local.email' :  user.local.email }, (error, user) => {

    // if there are any errors, return the error
    if (error) {
      error.status = 500;
      res.send(error);
      throw error;
    }

    // check to see if theres already a user with that email
    if (!user) {
      res.send({ status: 400, message: 'No such user was found' });
      throw new Error('No such user was found');
    }

    user.favourites = user.favourites.filter(id => id != movieID);
    user.save()
      .then(() => { res.send({ status: 200 }); })
      .catch(error => {
        error.status = 500;
        res.send(error);
        throw error;
      });
  });
};


utils.addComment = (req, res, commentData) => {
  console.log(`- add comment for ${commentData.movieID} from ${commentData.userID}`);
  let comment = new Comment(commentData);
  comment.save()
    .then(() => { res.send({ status: 200 }); })
    .catch(error => {
      res.send({ status: 500 });
      throw error;
    });
};


utils.removeComment = (req, res, commentData) => {
  console.log(`- remove comment for ${commentData.movieID} from ${commentData.userID}`);
  let qObj = {
    userID: commentData.userID,
    movieID: commentData.movieID,
    timestamp: commentData.timestamp
  };
  Comment.remove(qObj).exec()
    .then(() => { res.send({ status: 200 }); })
    .catch(error => {
      res.send({ status: 500 });
      throw error;
    });
};


module.exports = utils;
