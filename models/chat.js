// models related to chat

var mongoose = require('mongoose')
  ,Schema = mongoose.Schema
  ,ObjectId = Schema.ObjectId;
 
 // chat room

var chatRoomSchema = new Schema({
  name: { type: String, default: 'Untitled Chatroom' },
  created: { type: Date, default: Date.now },
  owner: {
    id: ObjectId,
    email: String,
    name: String
  },
  allowedUsers: [String],
  onlineUsers: [ObjectId]

});
 
module.exports.ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

// chat message
var chatMessageSchema = new Schema({
  room: ObjectId,
  user: {
    id: ObjectId,
    email: String,
    name: String,
    avatar: String
  },
  message: String,
  sent: { type: Date, default: Date.now }
});

module.exports.ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// uploaded files

var uploadedFileSchema = new Schema({
  chatRoom: ObjectId,
  title: String,
  uploaded: { type: Date, default: Date.now },
  user: {
    id: ObjectId,
    email: String,
    name: String
  },
  size: Number
});

module.exports.UploadedFile = mongoose.model('UploadedFile',
  uploadedFileSchema);