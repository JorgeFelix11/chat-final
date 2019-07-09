const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  message: {type: String},
  date: {type: String}
})

// const participantSchema = mongoose.Schema({
//   _id: {type: String}
// })
const conversationSchema = mongoose.Schema({
  participants: [{_id: String}],
  messages: [messageSchema],
  name: String
})


module.exports = mongoose.model('Conversations', conversationSchema);