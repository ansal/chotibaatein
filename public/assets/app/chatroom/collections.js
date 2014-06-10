// collections for chat app

// global variable for adding app modules
var app = app || {};

(function(){

  app.RoomCollection = Backbone.Collection.extend({
    model: app.Room
  });

  app.MessageCollection = Backbone.Collection.extend({
    model: app.Message
  });

  app.PeopleCollection = Backbone.Collection.extend({
    model: app.People
  });

  app.FileCollection = Backbone.Collection.extend({
    model: app.File
  });

})();