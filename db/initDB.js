'use strict';

const Movie = require('../models/movie');
const data = require('./initData.json');

function insertBaseData() {
  data.input.forEach(movieData => {
    let movie = new Movie(movieData);
    movie.save()
      .catch(error => { throw error; });
  });
}

function initDB() {
  Movie.find({}).exec()
    .then(movies => movies.length)
    .then(amount => {
      if (amount) return;
      insertBaseData();
      console.log('- DB initialized successfully');
    })
    .catch(error => { throw error; });
}

module.exports = initDB;
