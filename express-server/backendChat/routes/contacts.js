const express = require('express');
const axios = require('axios');
const checkAuth = require('../../backendUsers/middleware/check-auth')

const router = express.Router();

const Contacts = require('../models/contacts')

router.post('/onsignup', (req, res, next) => {
  const newContact = new Contacts({
    _id: req.body._id,
    contacts: []
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

router.post('/onlogin', (req, res, next) => {
  Contacts.findById(req.body.id, (err, response) => {
      res.status(200).json({
        message: 'Here are all your contacts',
        user: response
      })
  })
})

router.post('/getuser', (req, res, next) => {
  Contacts.findById(req.body.id)
    .then(user => {
      res.status(200).json({
        user
      })
    })
})

router.get('/getcontacts',checkAuth, (req, res, next) => {
  Contacts.findById(req.userData.userId)
    .then(user => {
      axios.post('http://localhost:3000/api/users/getcontacts', user.contacts)
        .then(response => {
          res.status(200).json({
            contacts: response.data.contacts
          })
        })
    })
})

router.post('/add',checkAuth, (req, res, next) => {
  axios.post('http://localhost:3000/api/users/getcontact', {email: req.body.email})
    .then(response => {
      Contacts.findByIdAndUpdate(response.data._id, {$push: {contacts: {_id: req.userData.userId, status: req.body.status}}}, {new: true})
        .then(user => {
          Contacts.findByIdAndUpdate(req.userData.userId, {$push: {contacts: {_id: response.data._id, status: "Pending"}}}, {new: true})
          .then(user => {
            axios.post('http://localhost:3000/api/users/getcontacts', user.contacts)
              .then(response => {
                res.status(200).json({
                  message: 'Everything went ok',
                  contacts: response.data.contacts
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

router.post('/accept',checkAuth, (req, res, next) => {
  const accepted = {
    _id: req.body.friendId,
    status: "Accepted"
  }
  const acceptor = {
    _id: req.userData.userId, 
    status: "Accepted"
  }
  Contacts.findById(accepted._id).findOneAndUpdate(
      {'contacts._id': acceptor._id}, 
      {'$set': {'contacts.$.status': acceptor.status}}, 
      {new: true})
    .then(user => {
      Contacts.findById(acceptor._id).findOneAndUpdate(
          {'contacts._id': accepted._id}, 
          {'$set': {'contacts.$.status': accepted.status}}, 
          {new: true})
        .then(acceptor => {
          axios.post('http://localhost:3000/api/users/getcontacts', acceptor.contacts)
          .then(response => {
            res.status(200).json({
              message: 'Everything went ok',
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
module.exports = router;