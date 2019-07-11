const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();

const User = require('../models/users');
const checkAuth = require('../middleware/check-auth')

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, "images")
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    // console.log(name)
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext)
  }
});

router.get('/hello', (req, res) => {
  res.send("Hello world");
})

router.post('/signup', multer({ storage }).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        imagePath: url + '/images/' + req.file.filename
      })
      newUser.save()
        .then(result => {
          let newUser = {
            _id: result._id
          }
          axios.post('http://localhost:5000/api/chat/onsignup', newUser)
            .then(result => {
              res.status(200).send(result.data)
            }).catch(e => {
              res.send({
                status: '500',
                message: "Error creating user",
                e
              })
            })
        })
        .catch(e => {
          res.status(500).json({
            message: 'error is here',
            error: e
          })
        })
    })
})

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'User Does Not Exist'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Wrong Password'
        })
      }

      const token = jwt.sign(
        {
          email: fetchedUser.email,
          userId: fetchedUser._id
        },
        'secret_for_token',
        { expiresIn: '1h' }
      );

      res.cookie('access_token', token)
      res.status(200).json({
        message: 'token provided in the cookie',
        user: {
          id: fetchedUser._id,
          email: fetchedUser.email,
          username: fetchedUser.username,
          imagePath: fetchedUser.imagePath
        }
      })
    })
    .catch(e => {
      res.status(401).json({
        message: 'Error HERE AUTH',
        e
      })
    })
})

router.post('/getcontact', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(contact => {
      res.status(200).json({
        _id: contact._id
      })
    })
})

router.post('/getcontacts', (req, res, next) => {
  let contactsInfo = [];
  const start = async () => {
    await asyncForEach(req.body, async (num) => {
      User.findById(num._id)
        .then(user => {
          contactsInfo.push({ email: user.email, username: user.username, imagePath: user.imagePath, status: num.status, _id: user._id })
        })
      await waitFor(50);
    });
    res.status(200).json({
      contacts: contactsInfo
    })
  }
  start();
})

router.post('/info', checkAuth, (req, res, next) => {
  User.findById(req.userData.userId, (err, response) => {
    res.status(200).json({
      message: 'already logged',
      user: {
        id: req.userData.userId,
        email: response.email,
        username: response.username,
        imagePath: response.imagePath
      }
    })
  })
})

router.post('/search', checkAuth, (req, res, next) => {
  User.findOne({ $and: [{ email: { $ne: req.userData.email } }, { email: req.body.email }] })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'User Does Not Exist'
        });
      }
      res.status(200).json({
        found: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          imagePath: user.imagePath
        }
      })
    })
    .catch(e => {
      res.status(500).json({
        message: 'User not found',
        e
      })
    })
})

router.post('/add', checkAuth, (req, res, next) => {
  let data = {
    contactData: req.body,
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/add', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})


router.get('/getcontactsdb', checkAuth, (req, res, next) => {
  let data = {
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/getcontacts', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.post('/accept', checkAuth, (req, res, next) => {
  let data = {
    friend: req.body,
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/accept', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.post('/chat', checkAuth, (req, res, next) => {
  let data = {
    info: req.body,
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/chat', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.post('/create-group', checkAuth, (req, res, next) => {
  let data = {
    groupInfo: req.body,
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/create-group', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.get('/getgroups', checkAuth, (req, res, next) => {
  let data ={
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/getgroups', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.post('/message', checkAuth, (req, res, next) => {
  let data ={
    messageInfo: req.body,
    userData: req.userData
  }
  axios.post('http://localhost:5000/api/chat/message', data)
    .then(result => {
      res.status(200).json(result.data)
    })
})

router.post('/logout', (req, res, next) => {
  res.clearCookie('access_token');
  res.status(200).json({
    message: 'already logged'
  });
})

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = router;