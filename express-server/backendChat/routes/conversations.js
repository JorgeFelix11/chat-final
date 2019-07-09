const express = require('express');
const moment = require('moment');
const router = express.Router();


const checkAuth = require('../../backendUsers/middleware/check-auth');
const Conversations = require('../models/conversations');
const Contact = require('../models/contacts');

router.post('/chat', checkAuth, (req, res, next) => {
  Contact.findOne({"_id": req.userData.userId}).select({contacts: {$elemMatch: {_id: req.body.friendId}}})
      .then(user => {
        if(user.contacts[0].conversation === ''){
          const newConversation = new Conversations({
            participants: {
              first: req.userData.userId,
              second: req.body.friendId
            },
            messages: []
          })
          newConversation.save()
          .then(conversation => {
            Contact.findById(req.userData.userId).findOneAndUpdate(
              {'contacts._id': req.body.friendId}, 
              {'$set': {'contacts.$.conversation': conversation._id}}, 
              {new: true})
            .then(() => {
              Contact.findById(req.body.friendId).findOneAndUpdate(
                {'contacts._id': req.userData.userId}, 
                {'$set': {'contacts.$.conversation': conversation._id}}, 
                {new: true})
                .then(() => {
                  res.status(200).json({
                    message: "Conversation Added",
                    conversation
                  })
                })
            })
          })
        }else{
          Conversations.findById(user.contacts[0].conversation)
            .then(conversation => {
              res.status(200).json({
                message: "Here is your conversation",
                conversation
              })
            })
        }
    })
})

router.post('/message', checkAuth, (req, res, next) => {
  const messageObj = {
    _id: req.userData.userId,
    message: req.body.message,
    date: moment().format("DD-MM-YYYY HH:mm")
  }
  
  Conversations.findByIdAndUpdate(req.body.conversation, {$push: {messages: {_id: messageObj._id, message: messageObj.message, date: messageObj.date}}}, {new: true})
    .then(conversation => {
      res.status(200).json({
        conversation
      })
    })
})

  // io.sockets.on('connection', (socket) => {
  //   console.log('Connected!!! from conversations.js')
  // })
  // io.sockets.on("connect", (socket) => {
  //   console.log('Connected!!')
  //   socket.on('message', message => {
  //     console.log(message)
  //   })
  //   io.emit('message', 'Hello amdafakas')
  // })
module.exports = router;