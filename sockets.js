// module dependencies

var sio = require('socket.io');
var connect = require('connect');
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;

// app modules
var configs = require('./config.js');
var User = require('./models/user.js');

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

    console.log('user connected \\o/');

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

      io.sockets.in(msg.room).emit('newMessage', {
        message: msg.message,
        user: user,
        room: msg.room,
        sent: new Date()
      });

      // TODO: save the message to db

    });

    socket.on('joinRoom', function(room){
      var room = room.room;
      socket.join(room, function(err){
        if(err) {
          console.log('Error joining room: ' + err);
        }
      });
    });

  });

};