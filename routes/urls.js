// URLS defined by all the routes
var pages = require('./index.js');
var groupchat = require('./groupchat.js');
var config = require('../config.js')
var utils = require('../utils.js');
var apis = require('./api.js');

module.exports = function(app, passport) {
  
  // Pages outside login
  app.get('/', pages.index);

  // pages after login
  app.get('/app', utils.restrictUser, groupchat.home);
  app.get('/app/manage-rooms', utils.restrictUser, groupchat.manageChatRoom);
  app.get('/app/getfile/:id', utils.restrictUser, groupchat.getFile);

  // restful apis

  // chat room
  app.get('/api/chatroom', utils.restrictUser, apis.AllChatRooms);
  app.post('/api/chatroom', utils.restrictUser, apis.CreateChatRoom);
  app.put('/api/chatroom/:id', utils.restrictUser, apis.UpdateChatRoom);
  app.delete('/api/chatroom/:id', utils.restrictUser, apis.DeleteChatRoom);

  // files
  app.get('/api/uploadfile', utils.restrictUser, apis.UploadedFiles );
  app.post('/api/uploadfile', utils.restrictUser, apis.UploadFile );

  // chat message
  app.get('/api/chatmessage', utils.restrictUser, apis.ChatMessages);
  // api to create chat message
  // wont be used in production
  // WARNING it wont check for user permissions, room etc
  //app.post('/api/chatmessage', utils.restrictUser, apis.CreateChatMessage);


  // authentication pages, mostly hooks up with passportjs
  
  // google

  app.get('/auth/login/google', passport.authenticate('google'));
  app.get(config.google.callbackURL, 
    passport.authenticate('google', { 
        successRedirect: '/',
        failureRedirect: '?loginError=true'
      })
  );

  // facebook

  app.get('/auth/login/facebook', passport.authenticate('facebook', {
    scope : 'email'
  }));
  app.get(config.facebook.callbackURL, 
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '?loginError=true'
    })
  );

  // github

  app.get('/auth/login/github', passport.authenticate('github', {
    scope: 'user:email'
  }));
  app.get(config.github.callbackURL, 
    passport.authenticate('github', {
      successRedirect: '/',
      failureRedirect: '?loginError=true'
    })
  );  

}