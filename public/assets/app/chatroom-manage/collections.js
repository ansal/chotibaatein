// global backbone app
var app = app || {};

// collection for model ChatRoom
(function(){

  var ChatRooms = Backbone.Collection.extend({
    model: app.ChatRoom,
    url: '/api/chatroom'
  });

  // create the collection and add to global app
  app.chatRooms = new ChatRooms();

})();