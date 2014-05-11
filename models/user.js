// user model used by all oauth providers

var mongoose = require('mongoose')
  ,Schema = mongoose.Schema
  ,ObjectId = Schema.ObjectId;
 
var UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    provider: String,
    google: {},
    facebook: {},
    twitter: {}
    
});
 
module.exports = mongoose.model('User', UserSchema);