// global backbone app
var app = app || {};

(function(){

  // all collections are bootstrapped backbone models using inline
  // js in jade
  // create collections
  app.Rooms = new app.RoomCollection();
  app.Messages = new app.MessageCollection();

  // create views
  var roomListView = new app.RoomListView();
  var messageListView = new app.MessageListView();

})();