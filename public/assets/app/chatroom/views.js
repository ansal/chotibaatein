// global backbone variable holding all modules
var app = app || {};

(function(){

  // individual room view
  app.RoomView = Backbone.View.extend({

    tagName : 'li',
    template: _.template( $('#roomTemplate').html() ),

    events: {
      'click .chatRoomLink': 'activateNewRoom'
    },

    initialize: function() {

      // cache dom elements
      this.$chatMessageTitle = $('#chatMessageTitle');
      this.$chatMessages = $('#chatMessages');
      this.$newChatArea = $('#newChatArea');

      // cache templates
      this.loadingHTML = $('#loadingMessage').html();
    },

    render: function() {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
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

      // set the progress bar and title of the message window
      this.$chatMessages.html(this.loadingHTML);
      this.$chatMessageTitle.text(this.model.get('name'));

      // load the messages via ajax for first (and last) time
      var room = $element.data('room');
      var that = this;
      $.ajax({
        type: 'GET',
        url: '/api/chatmessage',
        data: {
          room: room
        },
        dataType: 'json',
        success: function(data, textStatus) {
          app.Messages.reset(data);
          that.$newChatArea.show();

        },
        error: function(textStatus) {
          console.log('AJAX Error: ', textStatus);
          window.alert('Failed to connect to server. Please try again!');
        }
      });

    },

  });

  // room list view
  app.RoomListView = Backbone.View.extend({

    el: '#chatRooms',

    initialize: function() {

      // listen to collection events
      this.listenTo(app.Rooms, 'reset', this.addAllRooms);

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

  // individual message view
  app.MessageView = Backbone.View.extend({

    tagName: 'div',

    template: _.template( $('#chatMessageTemplate').html() ),

    render: function() {

      var html = this.template( this.model.toJSON() );
      this.$el.html( html );
      return this;

    }

  });

  app.MessageListView = Backbone.View.extend({

    el: '#chatWindow',

    events: {
      'keyup #newChatMessage': 'newChatMessage'
    },

    initialize: function() {

      // dom elements
      this.$messageList = $('#chatMessages');
      this.$newChatMessage = $('#newChatMessage');
      this.$newChatMessageButton = $('#newChatMessageButton');


      // collection events
      this.listenTo(app.Messages, 'reset', this.addAllMessages);
      this.listenTo(app.Messages, 'add', this.addOneMessage);

    },

    addOneMessage: function(message) {

      var view = new app.MessageView({ model: message });
      this.$messageList.append(view.render().el);

    },

    addAllMessages: function() {
      this.$messageList.html('');
      for(var i = app.Messages.length - 1; i >= 0; i -= 1) {
        this.addOneMessage(app.Messages.models[i]);
      }
    },

    newChatMessage: function(e) {

      var message = this.$newChatMessage.val().trim();
      if(e.which !== 13 || !message) {
        return;
      }

      app.Messages.add({
        message: message,
        user: {
          id: app.User._id,
          email: app.User.email,
          name: app.User.name,
          avatar: app.User[app.User.provider].picture
        },
        sent: new Date()
      });

      this.$newChatMessage.val('');

    }

  });

})();