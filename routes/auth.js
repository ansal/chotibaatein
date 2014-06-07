var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy

var User = require('../models/user.js');

module.exports = function(passport, configs) {

  // general passport setup
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Google oAuth login
  
  passport.use(new GoogleStrategy({
    clientID: configs.google.clientID,
    clientSecret: configs.google.clientSecret,
    callbackURL: configs.google.callbackURL,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({'google.id': profile.id}, function(err, user){
        if(err) { console.log(err); }
        // create a new user account if he doesnot exist
        if(!user) {
          var user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            google: profile._json
          });
          user.save(function(err){
            if(err) { console.log(err); }
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }
  ));

  // Facebook oAuth login
  
  passport.use(new FacebookStrategy({
    clientID: configs.facebook.clientID,
    clientSecret: configs.facebook.clientSecret,
    callbackURL: configs.facebook.callbackURL,
  },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      User.findOne({'facebook.id': profile.id}, function(err, user){
        if(err) { console.log(err); }
        // create a new user account if he doesnot exist
        if(!user) {
          var user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json
          });
          user.save(function(err){
            if(err) { console.log(err); }
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }
  ));

  // github oAuth login

  passport.use(new GithubStrategy({
    clientID: configs.github.clientID,
    clientSecret: configs.github.clientSecret,
    callbackURL: configs.github.callbackURL,
  },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      User.findOne({'github.id': profile.id}, function(err, user){
        if(err) { console.log(err); }
        // create a new user account if he doesnot exist
        if(!user) {
          var user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'github',
            github: profile._json
          });
          user.save(function(err){
            if(err) { console.log(err); }
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }
  ));

};