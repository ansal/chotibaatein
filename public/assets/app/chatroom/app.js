// global backbone app
var app = app || {};

(function(){

  // chat state
  app.state = {};

  // all collections are bootstrapped backbone models using inline
  // js in jade
  // create collections
  app.Rooms = new app.RoomCollection();
  app.Messages = new app.MessageCollection();

  // create views
  var roomListView = new app.RoomListView();
  var messageListView = new app.MessageListView();

  // create sockets
  app.socket = io.connect('', {
    'connection timeout' : 1000
  });
  app.socket.on('error', function(error){
    console.log('Opening socket to server failed: ', error);
  });
  app.socket.on('connect', function(){
    console.info('Opening socket to server completed successfully');
  });

  // listen to events
  app.socket.on('newMessage', function(msg){
    // only add message of other users in the current room user is in
    if(msg.user.id === app.User._id) {
      return;
    }
    // if the message is for other room, update the new message in those rooms 
    // and return
    if (msg.room !== app.state.room) {
      var room = app.Rooms.where({_id: msg.room})[0];
      var newMsgCount = room.get('newMsgCount');
      typeof newMsgCount === 'undefined' ?
        room.set('newMsgCount', 1) : 
        room.set('newMsgCount', newMsgCount + 1);
      return;
    }
    app.Messages.add(msg);
  });

})();