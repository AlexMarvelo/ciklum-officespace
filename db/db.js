'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const dbConfig = require('./db.config.json');
const db = mongoose.connection;
const Employee = require('../models/employee');
const initData = require('./db.initData.json');

module.exports = (app) => {
  if (app) {
    const dbURL = app.get('env') == 'production' || app.get('env') == 'local' ? dbConfig.url_remote : dbConfig.url_local;
    console.log(`- Connecting to ${dbURL}`);
    mongoose.connect(dbURL, dbConfig.options);

    db.on('disconnected', function() {
      console.log('- MongoDB disconnected');
      setTimeout(() => { mongoose.connect(dbConfig.url); }, dbConfig.reconnectInterval);
    });

    db.on('connected', function() {
      console.log('- MongoDB connected');
    });

    db.on('reconnected', function() {
      console.log('- MongoDB reconnected');
    });

    db.on('error', function() {
      // app.use(function(req, res) {
      //   console.log('MongoDB error');
      //   var err = new Error('Database connection failed');
      // });
    });

    db.once('open', function() {
      console.log('- MongoDB opened');
      initDB();
    });
  }
};

function initDB() {
  Employee.find({}).exec()
    .then(employees => employees.length)
    .then(amount => {
      if (amount) return;
      initData.input.forEach(employeeData => {
        let employee = new Employee(employeeData);
        employee.save()
          .catch(error => { throw error; });
      });
      console.log('- DB initialized successfully');
    })
    .catch(error => { throw error; });
}
