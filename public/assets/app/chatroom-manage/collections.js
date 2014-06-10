// global backbone app
var app = app || {};

// collection for model ChatRoom
(function(){

  app.ChatRooms = Backbone.Collection.extend({
    model: app.ChatRoom,
    url: '/api/chatroom'
  });

  // inorder to bootstrap backbone models, we can use the inlince script
  // included in jade script

})();