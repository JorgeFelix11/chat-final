const mongoose = require('mongoose');

const friendSchema = mongoose.Schema({
  status: {type: String, default: false},
  conversation: {type: String, default: ''}
})
const groupSchema = mongoose.Schema({
  id: {type: String}
}, {_id: false})
const contactSchema = mongoose.Schema({
  contacts: [friendSchema],
  groups: [groupSchema]
})

module.exports = mongoose.model('Contacts', contactSchema);