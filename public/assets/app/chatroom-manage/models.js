// global backbone app
var app = app || {};

// model for chat room

(function(){

  app.ChatRoom = Backbone.Model.extend({
    defaults: {
      name: 'Untitled Chatroom',
      allowedUsers: [],
      onlineUsers: []
    },
    idAttribute: '_id'
  });

})();