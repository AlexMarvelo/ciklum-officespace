'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
  local: {
    email    : String,
    password : String,
  }
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
