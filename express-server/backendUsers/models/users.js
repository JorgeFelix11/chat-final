const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  username: {type: String, required: true},
  gravatar: {type: String, required: true},
  // imagePath: {type: String, required: true},
  password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Users', userSchema);