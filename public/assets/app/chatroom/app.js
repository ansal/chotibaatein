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
    // only add message of other users
    if(msg.user.id !== app.User._id) {
      app.Messages.add(msg);
    }
  });

})();