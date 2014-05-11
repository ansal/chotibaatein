// URLS defined by all the routes
var routes = require('./index.js');

module.exports = function(app, passport) {
  
  // Pages outside login
  app.get('/', routes.index);

  // authentication pages
  app.get('/auth/login/google', passport.authenticate('google'));
  app.get('/auth/callback/google', 
    passport.authenticate('google', { successRedirect: '/',
    failureRedirect: '?loginError=true' })
  );

}