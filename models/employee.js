'use strict';

const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  id: String,
  seatID: String
});


const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
