// URLS defined by all the routes
var routes = require('./index.js');
var config = require('../config.js')

module.exports = function(app, passport) {
  
  // Pages outside login
  app.get('/', routes.index);

  // authentication pages
  
  // google

  app.get('/auth/login/google', passport.authenticate('google'));
  app.get(config.google.callbackURL, 
    passport.authenticate('google', { successRedirect: '/',
    failureRedirect: '?loginError=true' })
  );

  // facebook

  app.get('/auth/login/facebook', passport.authenticate('facebook'));
  app.get(config.facebook.callbackURL, 
    passport.authenticate('facebook', { successRedirect: '/',
    failureRedirect: '?loginError=true' })
  );

}