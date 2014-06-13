// module dependencies

var sio = require('socket.io');
var connect = require('connect');
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;

// app modules
var configs = require('./config.js');
var User = require('./models/user.js');
var ChatModels = require('./models/chat.js');

module.exports = function(app, server, mongostore) {

  // start socket io server
  var io = sio.listen(server);

  // socket authorization
  // checks for connect.sid in cookie
  io.use(function(hsData, accept){

    hsData = hsData.handshake;

    // inorder to fetch data from mongo, we need to connect to mongo
    // TODO: may be this can be a mongoose model
    function getSessionObject(err, db) {
      if(err) {
        console.dir(err);
        return accept('Error retrieving session - mongo failed!', false);
      }
      var sessionCollections = db.collection(configs.sessionCollection);
      sessionCollections.findOne({_id: sessionId}, checkPassportUser);
    }

    // check whether there is a passport obj in session
    function checkPassportUser(err, session) {
      if(err || !session) {
        console.dir(err);
        return accept('Error retrieving session!', false);
      }
      
      // check whether the session object has a passport object with user field
      // this tells that user is logged in via passport or not
      var passportObj = JSON.parse(session.session);
      if (typeof passportObj.passport.user === 'undefined') {
        return accept('User not logged in!', false);
      }

      // load the user from collection and add to header
      User.findOne({_id: passportObj.passport.user}, addUserDataToHeader);

    }

    function addUserDataToHeader(err, user){
      if(err) {
        return accept('Socket session - User not found in session', false);
      }
      
      hsData.chotibaatein = {
        user: user
      };

      return accept(null, true);

    }

    // parse the cookies
    // TODO: connect is rasing a warning that this api is moved to private?
    if(hsData.headers.cookie) {

      // parse the signed cookie by connect
      var parsedCookie = cookie.parse(hsData.headers.cookie);
      var sessions = connect.utils.parseSignedCookies(
        parsedCookie,
        configs.sessionSecret
      );
      var sessionId = sessions['connect.sid'];

      // now that cookie is there, get the session data from mongo collections
      MongoClient.connect(configs.db, getSessionObject);
    
    } else {
      console.log('Socket error: no cookie in header');
      return accept('No cookie transmitted.', false);
    }    

  });

  io.on('connection', function(socket){

    var hs = socket.handshake;
    var user = {
      id: hs.chotibaatein.user._id,
      email: hs.chotibaatein.user.email,
      name: hs.chotibaatein.user.name,
      avatar: hs.chotibaatein.user[hs.chotibaatein.user.provider].picture
    };

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('myMessage', function(msg){

      // this might slow down the whole app
      // may be a better strategy is to generate a uuid for each room
      // and use that
      ChatModels.ChatRoom.findOne({
        _id: msg.room
      }, function(err, chatRoom){

        if(err) {
          console.log(err);
          return;
        }

        // check whether the user is owner or an allowed user of the room
        if(user.email !== chatRoom.owner.email
          && chatRoom.allowedUsers.indexOf(user.email) === -1
        ) {
          return;
        }

        var newMessage = {
          message: msg.message,
          user: user,
          room: msg.room,
          sent: new Date()
        };

        // emit the signal and message
        io.sockets.in(msg.room).emit('newMessage', newMessage);

        // save the message to db
        var chatMessage = new ChatModels.ChatMessage(newMessage);
        chatMessage.save(function(err){
          if(err) {
            console.log(err);
            return;
          }
        });

      });

    });

    socket.on('joinRoom', function(room){
      var room = room.room;

      // check whether the user is allowed to join this room
      ChatModels.ChatRoom.findOne({
        _id: room
      }, function(err, chatRoom){
        
        if(err || !chatRoom) {
          console.log(err);
          return;
        }

        // check whether the user is owner or an allowed user of the room
        if(user.email !== chatRoom.owner.email
          && chatRoom.allowedUsers.indexOf(user.email) === -1
        ) {
          return;
        }

        var onlineUsers = chatRoom.onlineUsers;

        // broadcast newUser event
        io.sockets.in(room).emit('newUser', {
          room: room,
          newUser: user,
          onlineUsers: onlineUsers
        });

        user.room = room;

        socket.join(room, function(err){
          
          if(err) {
            console.log('Error joining room: ' + err);
            return;
          }

          // update online users in db
          var usersAlreadyinDb = onlineUsers.filter(function(u){
            return u.id.toString() === user.id.toString();
          });
          if(usersAlreadyinDb.length === 0) {
            onlineUsers.push(user);
          
            // save room
            chatRoom.onlineUsers = onlineUsers;
            chatRoom.save(function(err, savedObject){

              if(err) {
                console.log(err);
                return;
              }

            });
          }

        });

      });

    });

    socket.on('myFile', function(file){

      console.log(file)

      // check whether the user is allowed to message in this room
      ChatModels.ChatRoom.findOne({
        _id: file.chatRoom
      }, function(err, chatRoom){

        if(err || !chatRoom) {
          console.log(err);
          return;
        }

        // check whether the user is owner or an allowed user of the room
        if(user.email !== chatRoom.owner.email
          && chatRoom.allowedUsers.indexOf(user.email) === -1
        ) {
          return;
        }

        io.sockets.in(file.chatRoom).emit('newFile', file);

      });

    });

    socket.on('disconnect', function(){

      ChatModels.ChatRoom.findOne({
        _id: user.room
      }, function(err, chatRoom){

        if(err || !chatRoom) {
          console.log(err);
          return;
        }

        // check whether the user is owner or an allowed user of the room
        if(user.email !== chatRoom.owner.email
          && chatRoom.allowedUsers.indexOf(user.email) === -1
        ) {
          return;
        }

        io.sockets.in(user.room).emit('userLeft', {
          user: user,
          room: user.room
        });

        // find the index of online user
        for(var i = 0; i < chatRoom.onlineUsers.length; i += 1) {
          if( chatRoom.onlineUsers[i].id.toString() === user.id.toString()  ) {
            break;
          }
        }

        // user is not on the list
        if(i === chatRoom.onlineUsers.length) {
          return;
        }

        // remove the user from the list and save
        chatRoom.onlineUsers.splice(i, 1);
        chatRoom.save(function(err){
          if(err) {
            console.log(err);
            return;
          }
        });

      });



    });

  });

};