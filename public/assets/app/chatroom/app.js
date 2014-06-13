// global backbone app
var app = app || {};

(function(){

  // chat state
  app.state = {};

  // online users
  app.state.onlineUsers = [];

  // all collections are bootstrapped backbone models using inline
  // js in jade
  // create collections
  app.Rooms = new app.RoomCollection();
  app.Messages = new app.MessageCollection();

  // create views
  var roomListView = new app.RoomListView();
  var messageListView = new app.MessageListView();

  // create sockets
  app.socket = io.connect('', {
    'connection timeout' : 1000
  });

   // listen to events
  app.socket.on('error', function(error){
    console.log('Opening socket to server failed: ', error);
  });
  app.socket.on('connect', function(){
    console.info('Opening socket to server completed successfully');
  });
  app.socket.on('newUser', function(data){
    // check whether the data is for this room
    if(data.room !== app.state.room) {
      return;
    }
    for(var i  = 0; i < data.onlineUsers.length; i+=1) {
      
      // only add the new user if he is not on the list
      var userInList = $('#peopleList').children();
      var userAlreadyInList = _.filter(userInList, function(li){
        if($(li).data('user-id') === data.onlineUsers[i].id) {
          return true;
        }
      });

      if(userAlreadyInList.length !== 0) {
        continue;
      }
      var peopleTemplate = _.template('<li class="list-group-item list-group" data-user-id="<%= newUser.id %>" > <%= newUser.name %></li>');
      var peopleHTML = peopleTemplate({
        newUser: data.onlineUsers[i]
      });
      $('#peopleList').append(peopleHTML);
    }

    app.state.onlineUsers = data.onlineUsers;
  });
  
  app.socket.on('newMessage', function(msg){
    // only add message of other users in the current room user is in
    if(msg.user.id === app.User._id) {
      return;
    }
    // if the message is for other room, update the new message in those rooms 
    // and return
    if (msg.room !== app.state.room) {
      var room = app.Rooms.where({_id: msg.room})[0];
      var newMsgCount = room.get('newMsgCount');
      typeof newMsgCount === 'undefined' ?
        room.set('newMsgCount', 1) : 
        room.set('newMsgCount', newMsgCount + 1);
      return;
    }
    app.Messages.add(msg);
  });

  app.socket.on('newFile', function(file){

    var $fileList = $('#fileList');
    var $fileWindow = $('#fileWindow');

    if(file.chatRoom !== app.state.room) {
      return;
    }

    var template = _.template( $('#fileTemplate').html() );
    var html = template( file );
    $fileList.append( html )
    $fileWindow.scrollTop($fileWindow.prop('scrollHeight'));;

  });

  // click handlers for buttons to hide either of the three boxes

  var $chatRoomCol = $('#chatRoomCol');
  var $chatMessageCol = $('#chatMessageCol');
  var $peopleFileCol = $('#peopleFileCol');
  var $chatRoomShowButton = $('#chatRoomShowButton');
  var $peopleFileShowButton = $('#peopleFileShowButton');

  $('#chatRoomHideButton').on('click', function(e){
    $chatRoomCol.hide('fast');
    if($peopleFileCol.css('display') === 'none') {
      $chatMessageCol.removeClass('col-md-9').addClass('col-md-12');
    } else {
      $chatMessageCol.removeClass('col-md-6').addClass('col-md-9');
    }
    $chatRoomShowButton.fadeIn();
  });

  $('#peopleFileHideButton').on('click', function(e){
    $peopleFileCol.hide('fast');
    if($chatRoomCol.css('display') === 'none') {
      $chatMessageCol.removeClass('col-md-9').addClass('col-md-12');
    } else {
      $chatMessageCol.removeClass('col-md-6').addClass('col-md-9');
    }
    $peopleFileShowButton.fadeIn();
  });  

  $chatRoomShowButton.on('click', function(e){
    $(this).hide('fast');
    $chatRoomCol.fadeIn();
    if($peopleFileCol.css('display') === 'none') {
      $chatMessageCol.removeClass('col-md-12').addClass('col-md-9');
    } else {
      $chatMessageCol.removeClass('col-md-9').addClass('col-md-6');
    }
  });

  $peopleFileShowButton.on('click', function(e){
    $(this).hide('fast');
    $peopleFileCol.fadeIn();
    if($chatRoomCol.css('display') === 'none') {
      $chatMessageCol.removeClass('col-md-12').addClass('col-md-9');
    } else {
      $chatMessageCol.removeClass('col-md-9').addClass('col-md-6');
    }
  });

  // activate the correct menu link in navigation bar
  $('#' + $('#pageName').val() ).addClass('active');

})();