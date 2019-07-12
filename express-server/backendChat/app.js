const express = require("express");
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const Contacts = require('./models/contacts')
const Conversations = require('./models/conversations');
const moment = require('moment');

const appChat = express();
const port = process.env.PORT || 5000;


const serverChat = appChat.listen(port, () => {
  console.log('connected to port 5000')
})

let socketIO = require('socket.io')
let io = socketIO(serverChat)

mongoose.connect('mongodb://localhost:27017/final-chat-app-CHAT', {
  useNewUrlParser: true,
  useCreateIndex: true
})
  .then(() => {
    console.log('Connected to database from chat server!');
  })
  .catch(e => {
    console.log('Failed connecting to database');
    console.log(e);
  })

mongoose.set('useFindAndModify', false)
appChat.set('socketIO', io)
appChat.use(bodyParser.json())
appChat.use(bodyParser.urlencoded({ extended: false }));
appChat.use(cookieParser());

appChat.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true)
  req.io = io;
  next();
});

appChat.get('/api/chat/hello', (req, res) => {
  res.send("Hello world from chat");
})

  appChat.post('/api/chat/chat', (req, res, next) => {
    if(!req.body.info.groupId){
      Contacts.findOne({ "_id": req.body.userData.userId }).select({ contacts: { $elemMatch: { _id: req.body.info.friendId } } })
        .then(user => {
          Conversations.findById(user.contacts[0].conversation)
            .then(conversation => {
              axios.post('http://express-users:3000/api/users/getcontacts', conversation.participants)
              .then(response => {
                res.status(200).json({
                  message: "Here is your conversation",
                  conversation,
                  contacts: response.data.contacts,
                })
              })
            })
        })
    }else{
      Contacts.findOne({ "_id": req.body.userData.userId }).select({ groups: { $elemMatch: { id: req.body.info.groupId } } })
      .then(user => {
        Conversations.findById(user.groups[0].id)
          .then(conversation => {
            axios.post('http://express-users:3000/api/users/getcontacts', conversation.participants)
            .then(response => {
              res.status(200).json({
                message: "Here is your conversation",
                conversation,
                contacts: response.data.contacts,
              })
            })
          })
      })
    }
  })
  
  appChat.post('/api/chat/message', (req, res, next) => {
    const messageObj = {
      contact: req.body.userData.email,
      _id: req.body.userData.userId,
      message: req.body.messageInfo.message,
      date: moment().format("DD-MM-YYYY HH:mm")
    }
    Conversations.findByIdAndUpdate(req.body.messageInfo.conversation, { $push: { messages: { _id: messageObj._id, message: messageObj.message, date: messageObj.date } } }, { new: true })
      .then(conversation => {
        io.sockets.in(conversation._id).emit('message', {messageObj, conversation: conversation._id})
        res.status(200).json({
          conversation
        })
      })
  })

  appChat.post('/api/chat/onsignup', (req, res, next) => {
    const newContact = new Contacts({
      _id: req.body._id,
      contacts: [],
      groups: []
    })
    newContact.save()
      .then(user => {
        res.status(200).json({
          message: "Contacts database initiated",
          user
        })
      }).catch(e => {
        res.status(500).json({
          message: "error is in the server of CHAT",
          e
        })
      })
  })

  appChat.post('/api/chat/onlogin', (req, res, next) => {
    Contacts.findById(req.body.id, (err, response) => {
      res.status(200).json({
        message: 'Here are all your contacts',
        user: response
      })
    })
  })

  appChat.post('api/chat/getuser', (req, res, next) => {
    Contacts.findById(req.body.id)
      .then(user => {
        res.status(200).json({
          user
        })
      })
  })

  appChat.post('/api/chat/getcontacts', (req, res, next) => {
    Contacts.findById(req.body.userData.userId)
      .then(user => {
        axios.post('http://express-users:3000/api/users/getcontacts', user.contacts)
          .then(response => {
            res.status(200).json({
              contacts: response.data.contacts,
              userContacts: user
            })
          })
      })
  })

  appChat.post('/api/chat/getgroups', (req, res, next) => {
    let conversationInfo = [];
    Contacts.findById(req.body.userData.userId)
      .then(user => {
        const start = async () => {
          await asyncForEach(user.groups, async (group) => {
            Conversations.findById(group.id)
              .then(theGroup => {
                conversationInfo.push({ group: theGroup.name, participants: theGroup.participants, _id: group.id})
              })
            });
          await waitFor(50);
          res.status(200).json({
            conversationInfo
          })
        }
        start();
      })
  })

  appChat.post('/api/chat/add', (req, res, next) => {
    axios.post('http://express-users:3000/api/users/getcontact', { email: req.body.contactData.email })
      .then(response => {
        Contacts.findByIdAndUpdate(response.data._id, { $push: { contacts: { _id: req.body.userData.userId, status: req.body.contactData.status } } }, { new: true })
          .then(user => {
            Contacts.findByIdAndUpdate(req.body.userData.userId, { $push: { contacts: { _id: response.data._id, status: "Pending" } } }, { new: true })
              .then(user => {
                axios.post('http://express-users:3000/api/users/getcontacts', user.contacts)
                  .then(response2 => {
                    io.sockets.in(response.data._id).emit('add-contact', true);
                    res.status(200).json({
                      message: 'Everything went ok',
                      contacts: response2.data.contacts
                    })
                  })
              })
              .catch(e => {
                res.status(500).json({
                  message: 'Error Adding a Contact',
                  e
                })
              })
          })
          .catch(e => {
            res.status(500).json({
              message: 'Something went wrong adding to friend requests',
              e
            })
          })
      })
  })

  appChat.post('/api/chat/accept', (req, res, next) => {
    const accepted = {
      _id: req.body.friend.friendId,
      status: "Accepted"
    }
    const acceptor = {
      _id: req.body.userData.userId,
      status: "Accepted"
    }

    const newConversation = new Conversations({
      participants: [{_id: accepted._id}, {_id: acceptor._id}],
      messages: []
    })
    newConversation.save()
      .then(newConv => {
        Contacts.findById(accepted._id).findOneAndUpdate(
          { 'contacts._id': acceptor._id },
          { '$set': { 'contacts.$.status': acceptor.status, "contacts.$.conversation": newConv._id } },
          { new: true })
          .then(() => {
            Contacts.findById(acceptor._id).findOneAndUpdate(
              { 'contacts._id': accepted._id },
              { '$set': { 'contacts.$.status': accepted.status, "contacts.$.conversation": newConv._id } },
              { new: true })
              .then(acceptor => {
                axios.post('http://express-users:3000/api/users/getcontacts', acceptor.contacts)
                  .then(response => {
                    io.sockets.in(accepted._id).emit('accept', {userId: req.body.userData.userId, conversationId: newConv._id})
                    res.status(200).json({
                      message: 'Everything went ok',
                      acceptor,
                      contacts: response.data.contacts
                    })
                  })
              })
              .catch(e => {
                res.status(500).json({
                  message: 'Error Adding Friend',
                  e
                })
              })
          })
          .catch(e => {
            res.status(500).json({
              message: 'Error Adding Friend',
              e
            })
          })
      })
  })

  appChat.post('/api/chat/create-group', (req, res, next) => {
    req.body.groupInfo.participants.push({_id: req.body.userData.userId})
    let participantsArr = req.body.groupInfo.participants;
    console.log(participantsArr)
    let newGroupConversation = new Conversations({
      name: req.body.groupInfo.name,
      participants: participantsArr
    })
    newGroupConversation.save()
      .then(newGroupConv => {
        const start = async () => {
          await asyncForEach(participantsArr, async (element) => {
            Contacts.findByIdAndUpdate(element._id, {"$push": {groups: {id: newGroupConv._id}}}, {new: true}).then(async () => {
              io.sockets.in(element._id).emit('group', {groupConversationId: newGroupConv._id})
              await waitFor(50);
            })
          });
          res.status(200).json({
            message: "Groups Created"
          })
        }
        start();
      })
  })

io.sockets.on('connection', (socket) => {
  console.log("connected")
    socket.on('join', (data) => {
      socket.join(data, () => {
        console.log(`${socket.id} Joined to room: ${data}`)
      });
    })
})
const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}