// global backbone variable holding all modules
var app = app || {};

(function(){

  // individual room view
  app.RoomView = Backbone.View.extend({

    tagName : 'li',
    template: _.template( $('#roomTemplate').html() ),

    initialize: function() {

      // listen to model events
      //this.listenTo(app);
    },

    render: function() {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    }

  });

  app.RoomListView = Backbone.View.extend({

    el: '#chatRooms',
    events: {
      'click .chatRoomLink': 'activateNewRoom'
    },

    initialize: function() {

      // listen to collection events
      this.listenTo(app.Rooms, 'reset', this.addAllRooms);

    },

    activateNewRoom: function(e) {
      e.preventDefault();

      var $element = $(e.target);
      var $li = $element.parent();
      var $chatRoomLinks = $('.chatRoomLink');

      // make link active
      $chatRoomLinks.parent().removeClass('active');
      $li.addClass('active');

      // hide the message notification
      $chatRoomLinks.find('span').show();
      $element.find('span').hide();
    },

    addAllRooms: function() {
      for(var i = 0; i < app.Rooms.length; i++) {
        var view = new app.RoomView({
          model: app.Rooms.models[i]
        });
        this.$el.append(view.render().el);
      }
    }

  });

})();