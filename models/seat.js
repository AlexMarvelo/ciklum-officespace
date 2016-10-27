'use strict';

const mongoose = require('mongoose');

const seatSchema = mongoose.Schema({
  id: String,
  title: String,
  userID: String,
  x: Number,
  y: Number,
  floorID: String,
});


const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
