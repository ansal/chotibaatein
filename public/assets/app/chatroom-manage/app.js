// global backbone app
var app = app || {};

(function(){

  // create a chat room collection
  app.chatRooms = new app.ChatRooms();

  // lets start the party :)
  var mainView = new app.ManageChatRoomView();

  // activate the correct page link in navigation bar
  $('#' + $('#pageName').val() ).addClass('active');

})();