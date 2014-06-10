// global backbone app
var app = app || {};

(function(){

  // main view
  // also handles removing of user from other rooms

  app.ManageChatRoomView = Backbone.View.extend({

    el: '#app',

    events: {
      'click #addChatRoom': 'createChatRoom'
    },

    initialize: function() {

      // cache dom elments
      this.$ownedRoomList = $('#ownedRoomList');
      this.$noChatRoomMessage = $('#noChatRoomMessage');

      // listen to collection events
      this.listenTo(app.chatRooms, 'add', this.addOneChatRoom);
      this.listenTo(app.chatRooms, 'reset', this.addAllChatRooms);

    },

    // method for adding one chat room to the list
    addOneChatRoom: function(chatRoom) {
      var view = new app.OwnedRoomView({ model: chatRoom});
      this.$ownedRoomList.append(view.render().el);
      this.$noChatRoomMessage.hide();
    },

    // method for adding all bootstrapped models into list
    addAllChatRooms: function() {
      var that = this;
      app.chatRooms.each(this.addOneChatRoom, this);
      // add a friendly message that no room exists
      if(app.chatRooms.length === 0) {
        this.$noChatRoomMessage.show();
      }
    },

    // asks user for a chatroom name and then add it to collection
    createChatRoom: function() {

      var name = 
        window.prompt('Whats in your mind?\n\n How about \'Panda Club\'?');
      if(!name) {
        return;
      }

      app.chatRooms.create({
        name: name
      });

    }

  });

  // view for manipulating owned Room
  app.OwnedRoomView = Backbone.View.extend({

    tagName: 'li',
    template: _.template( $('#ownedRoomTemplate').html() ),

    events: {
      'click .chatRoomLink': 'showUsers',
      'keyup .newUserToRoom': 'addNewUser',
      'click .removeUser': 'removeUser',
      'keyup .newRoomName': 'updateRoomName',
      'click .removeGroupButton': 'removeGroup'
    },

    initialize: function() {

      // listen to model events
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function(e) {
      var html = this.template( this.model.toJSON() );
      this.$el.html( html );
      // hide email list when all room models are added
      // but we dont want to hide it when a single model is updated
      if(typeof e !== 'undefined') {
        this.$el.find('.allowedUsersDiv').show();
        this.$el.find('.newUserToRoom').focus();
      }
      return this;
    },

    showUsers: function(e) {
      e.preventDefault();

      // hide all room options and hide this
      $('.allowedUsersDiv').hide();
      this.$el.find('.allowedUsersDiv').fadeToggle();
      this.$el.find('.newUserToRoom').focus();

    },

    addNewUser: function(e) {
      var newUserText = this.$el.find('.newUserToRoom');
      var email = $(newUserText).val().trim();
      // check whether user has pressed enter key or not
      // and then check for valid input
      if(e.which !== 13 || !email) {
        return;
      }

      var users = this.model.get('allowedUsers');
      users.push(email);
      this.model.set('allowedUsers', users);
      this.model.save();

      // clear the input for next input
      $(newUserText).val('');
    },

    removeUser: function(e) {
      e.preventDefault();
      // get the email address from hidden span field
      var email = $(e.target).parent().find('.emailAddress').text();
      var users = this.model.get('allowedUsers');
      users = _.without(users, email);
      this.model.set('allowedUsers', users);
      this.model.save();
    },

    updateRoomName: function(e) {
      var newRoomName = this.$el.find('.newRoomName');
      var name = $(newRoomName).val().trim();
      // check whether user has pressed enter key or not
      // and then check for valid input
      if(e.which !== 13 || !name) {
        return;
      }
      this.model.set('name', name);
      this.model.save();
    },

    removeGroup: function() {
      var confirmation = window.confirm('There is no going back!\n\nAre you sure?')
      if(confirmation) {
        this.model.destroy();
      }
    }

  });

})();