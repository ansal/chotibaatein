// global backbone app
var app = app || {};

(function(){

  // create a chat room collection
  app.chatRooms = new app.ChatRooms();

  // lets start the party by creating main view for chat rooms :)
  var mainView = new app.ManageChatRoomView();

  // create view for invited rooms
  var invitedView = new app.InvitedRoomView();

  // activate the correct page link in navigation bar
  $('#' + $('#pageName').val() ).addClass('active');

})();