// global backbone app
var app = app || {};

(function(){

  // all collections are bootstrapped backbone models using inline
  // js in jade
  app.Rooms = new app.RoomCollection();

  var roomListView = new app.RoomListView();

})();