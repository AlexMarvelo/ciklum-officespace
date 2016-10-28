'use strict';

const mongoose = require('mongoose');

const seatSchema = mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  title: String,
  employeeID: String,
  floorID: String,
});


const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
