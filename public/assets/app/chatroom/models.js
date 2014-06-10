// models for chat app

// global variable for adding app modules
var app = app || {};

(function(){

  app.Room = Backbone.Model.extend({
    defaults: {
      name: 'Untitled Room'
    }
  });

  app.Message = Backbone.Model.extend({
    defaults: {
      message: '--incomplete-message--'
    }
  });

  app.People = Backbone.Model.extend({
    defaults: {
      name: 'Unknown Person',
      onlineStatus: false
    }
  });

  app.File = Backbone.Model.extend({
    defaults: {
      name: '--corrupted-file---',
      
    }
  });

})();