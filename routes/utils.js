'use strict';

//const fetch = require('node-fetch');
const utils = {};


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
  let props = {
    pageTitle: 'Ciklum OfficeSpace'
  };
  res.render('index', props);
};


module.exports = utils;
