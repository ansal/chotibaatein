// module dependencies

var sio = require('socket.io');
var connect = require('connect');
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;

// app modules
var configs = require('./config.js');

module.exports = function(app, server) {

  // start socket io server
  var io = sio.listen(server);

  // socket authorization
  // checks for connect.sid in cookie
  // this wont check for whether a user is authorized
  // or not to join a room
  io.set('authorization', function(hsData, accept){

    // inorder to fetch data from mongo, we need to connect to mongo
    // TODO: may be this can be a mongoose model
    function getSessionObject(err, db) {
      if(err) {
        console.dir(err);
        return accept('Error retrieving session - mongo failed!', false);
      }
      var sessionCollections = db.collection(configs.sessionCollection);
      sessionCollections.findOne({_id: sessionId}, saveHeaderData);
    }

    // saves user info and other info in websocket header
    function saveHeaderData(err, session) {
      if(err || !session) {
        console.dir(err);
        return accept('Error retrieving session!', false);
      }
      
      // check whether the session object has a passport field
      // this tells that user is logged in via passport

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
/*
    if(socket.handshake.headers.cookie) {

      var parsedCookie = cookie.parse(socket.handshake.headers.cookie);
      var sessionId = connect.utils.parseSignedCookies(parsedCookie, 'thisShouldNotBeUsedInProduction');
      console.log(sessionId);
    
    }
*/

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('newMessage', function(msg){
      io.emit('newMessage', msg);
    });
  });

};