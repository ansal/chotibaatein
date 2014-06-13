// The main chat app routes
// most of these stuff happens after login

var AWS = require('aws-sdk');
// load the AWS SDK from file
AWS.config.loadFromPath('awsconfig.json');

// app modules
var ChatModels = require('../models/chat.js');
var configs = require('../config.js');

// page after login
// this is where chat happens
exports.home = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;

  // for bootstraping backbone models
  ChatRoom
  .find()
  .or([ {'owner.id': req.user._id}, { 'allowedUsers': req.user.email } ])
  .sort('name')
  .exec(function(err, ownedRooms){

    if(err) {
      console.log(err);
      res.send(500);
      return;
    }

    res.render('app/index.jade', {
      //user info
      user: JSON.stringify(req.user),
      // inorder to use as an inline JS, convert models into string first
      ownedRooms: JSON.stringify(ownedRooms)
    });

  });

};

// page for managing chat rooms
// this is a small backbone app
exports.manageChatRoom = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;

  // bootstrap backbone models
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
      // inorder to use as an inline JS, convert models into string first
      ownedRooms: JSON.stringify(ownedRooms)
    });

  });

};

// download a file from chatroom
// gets presigned url from aws s3 and redirects user to that url
exports.getFile = function(req, res) {

  ChatModels.UploadedFile.findOne({
    _id: req.params.id
  }, function(err, file){

    if(err || !file) {
      res.send(500);
      return;
    }

    // check whether the user is allowed to access the files in the room
    ChatModels.ChatRoom.findOne({
      _id: file.chatRoom
    })
    .or([ {'owner.id': req.user._id}, { 'allowedUsers': req.user.email } ])
    .exec(function(err, chatRoom){

      if(err || !chatRoom) {
        res.send(403);
        return;
      }

      // get the amazon presigned url
      var s3 = new AWS.S3();
      params = {
        Bucket: configs.s3Bucket + '/' + chatRoom._id,
        Key: '' + file.s3Id,
        Expires: 60 * 60
      }

      res.redirect ( s3.getSignedUrl('getObject', params) );

    });

  });

};

// logouts a user
exports.logout = function(req, res) {

  req.logout();
  res.redirect('?loggedOut=true');

};