'use strict';

const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
  Title: String,
  Year: Number,
  imdbID: String,
  Type: String,
  Poster: String
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
