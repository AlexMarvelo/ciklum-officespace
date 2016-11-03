'use strict';

const mongoose = require('mongoose');

const floorSchema = mongoose.Schema({
  id: String,
  title: String,
  mapSource: String,
  width: Number,
});


const Floor = mongoose.model('Floor', floorSchema);

module.exports = Floor;
