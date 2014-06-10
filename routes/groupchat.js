// The main chat app routes
// most of these stuff happens after login

// app modules
var ChatModels = require('../models/chat.js');

// page after login
// this is where chat happens
exports.home = function(req, res) {

  res.render('app/index.jade');

};

// page for managing chat rooms
// this is a small backbone app
exports.manageChatRoom = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;

  // find the rooms created by the user
  ChatRoom
  .find()
  .where('owner.id').equals(req.user._id)
  .exec(function(err, ownedRooms){

    if(err) {
      console.log(err);
      res.send(500);
      return;
    }

    res.render('app/manage-chat-rooms.jade', {
      ownedRooms: ownedRooms
    });

  });

};