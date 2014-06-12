// simple restful apis for accessing mongoose models

// module dependancies

var fs = require('fs');
var AWS = require('aws-sdk');
// load the AWS SDK from file
AWS.config.loadFromPath('awsconfig.json');

// app modules
var ChatModels = require('../models/chat.js')
var configs = require('../config.js');

// create a chat room
module.exports.CreateChatRoom = function(req, res) {
  
  var ChatRoom = ChatModels.ChatRoom;
  
  var room = new ChatRoom({
    name: typeof req.body.name !== 'undefined' ? 
                      req.body.name: 'Untitled Room',
    owner: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    },
    allowedUsers: [],
    onlineUsers: []
  });
  room.save(function(err){
    if(err) {
      console.log(err);
      res.send(500);
      return;
    }
    res.json(room);
  });

};

// lists out all chatrooms created by a user
module.exports.AllChatRooms = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;
  ChatRoom
  .find()
  .where('owner.id').equals(req.user._id)
  .exec(function(err, rooms){
    if(err) {
      console.log(err);
      res.send(500);
      return;
    }
    res.json(rooms);
  });

};

// updates a chat room
module.exports.UpdateChatRoom = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;

  ChatRoom.findOne({
    _id: req.params.id
  })
  .where('owner.id').equals(req.user._id)
  .exec(function(err, room){
    if(err) {
      console.log(err);
      res.json(500);
      return;
    }
    if(!room) {
      res.json(404);
      return;
    }
    room.name = typeof req.body.name !== 'undefined' ? 
        req.body.name: 'Untitled Room';
    room.allowedUsers = req.body.allowedUsers;
    room.onlineUsers = req.body.onlineUsers;
    room.save(function(err, savedRoom){
      if(err) {
        console.log(err);
        res.json(500);
        return;
      }
      res.json(savedRoom);
    });
  });

};

// deletes a chat room
module.exports.DeleteChatRoom = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;
  ChatRoom.findOne({
    _id: req.params.id
  })
  .where('owner.id').equals(req.user._id)
  .remove()
  .exec(function(err){

    if(err) {
      console.log(err);
      res.json(500);
      return;
    }

    res.json({
      'success': 'object deleted'
    });

  });

};

// list out recent NUM_MESSAGES chat messages of a room
module.exports.ChatMessages = function(req, res) {

  var ChatRoom = ChatModels.ChatRoom;
  var ChatMessage = ChatModels.ChatMessage;
  var NUM_MESSAGES = 50;

  // get the room and see whether user is allowed to access messages
  ChatRoom.findOne({
    _id: req.query.room
  }, function(err, room){
    if(err) {
      console.log(err);
      res.send(500);
      return;
    }

    if(!room) {
      res.send(404);
      return;
    }

    // check whether the user is owner or an allowed user of the room
    if(req.user.email !== room.owner.email
      && room.allowedUsers.indexOf(req.user.email) === -1
    ) {
      res.send(404);
      return;
    }

    // the user is allowed to access the messages

    ChatMessage.find({
      room: req.query.room
    })
    .sort('-sent')
    .limit(NUM_MESSAGES)
    .exec(function(err, messages){
      
      if(err) {
        console.log(err);
        res.send(500);
        return;
      }

      res.json(messages);

    });

  });

};

// uploads a file to amazon S3
module.exports.UploadFile = function(req, res) {

  if(typeof req.files.upload === 'undefined') {
    res.json(500, {
      error: 'I need a file to upload'
    });
    return;
  }

  if(req.files.upload.size > configs.maxUploadFileSize) {
    res.json(500, {
      error: 'Uploaded file is greater than ' + configs.maxUploadFileSize
    });
    return;
  }

  // check whether the user is allowed to upload file in this room
  var room = req.body.room;
  ChatModels.ChatRoom
  .findOne({
    _id: room
  })
  .or([ {'owner.id': req.user._id}, { 'allowedUsers': req.user.email } ])
  .exec(function(err, chatRoom){

    if(err || !chatRoom) {
      res.json(403, {
        error: 'User is not allowed to upload here'
      });
      return;
    }

    // user is allowed to post here
    // so send the file to s3
    var s3 = new AWS.S3();
    s3.client.createBucket({Bucket: configs.s3Bucket}, function() {
      fs.readFile(req.files.upload.path, function(err, fileBuffer){

        if(err) {
          res.json(500, {
            error: 'Failed to upload file to Amazon s3'
          });
          return;
        }

        var folder = configs.s3Bucket + '/' + chatRoom._id;
        console.log(configs.s3Bucket, ' ', chatRoom._id)
        var data = { 
          Bucket: folder,
          Key: req.files.upload.name,
          Body: fileBuffer
        };
        s3.client.putObject(data, function(err){

          if(err) {
            res.json(500, {
              error: 'Failed to upload file to Amazon s3'
            });
            return;
          }

          // save the file info to database
          var uploadedFile = ChatModels.UploadedFile({
            chatRoom: chatRoom._id,
            title: req.files.upload.name,

            //s3 id is user id +  current unix time + '-' uploaded file name
            s3Id: req.user._id + new Date().getTime() + req.files.upload.name,
            
            user: {
              id: req.user._id,
              email: req.user.email,
              name: req.user.name,
              avatar: req.user[req.user.provider].picture
            }
          });
          uploadedFile.save(function(err, savedObject){
            
            if(err) {
              res.json(500, {
                error: 'Uploading file failed'
              });
              return;
            }

            res.json(savedObject);

          });

        });
      });
    });

  });


};

// create a chat message
// this is only used for testing purpose only
// WARNING it wont check for user permissions, room etc
module.exports.CreateChatMessage = function(req, res) {

  var ChatMessage = ChatModels.ChatMessage;

  var message = new ChatMessage({
    room: req.body.room,
    message: req.body.message,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user[req.user.provider].picture
    }
  });
  // remove this to test
  return;
  message.save(function(err, savedMsg){

    if(err) {
      console.log(err);
      res.send(500);
      return;
    }

    res.json(savedMsg);

  });

};