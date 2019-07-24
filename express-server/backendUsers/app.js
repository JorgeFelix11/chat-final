const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path')

const appUsers = express();
const port = process.env.PORT || 3000;

const serverChat = appUsers.listen(port, () => {
  console.log(`connected to port 3000`)
})

const userRoute = require('./routes/users');

mongoose.connect('mongodb://database:27017/final-chat-app-USERS', {
// mongoose.connect('mongodb://localhost:27017/final-chat-app-USERS', {
  useNewUrlParser: true, 
  useCreateIndex: true})
    .then(() => {
      console.log('Connected to database from users server!');
    })
    .catch(e => {
      console.log('Failed connecting to users database');
      console.log(e);
    })

appUsers.use(bodyParser.json())
appUsers.use(bodyParser.urlencoded({extended: false}));
appUsers.use("/images", express.static(path.join(__dirname, "images")))
appUsers.use(cookieParser());

appUsers.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true)
  next();
});

appUsers.use('/api/users', userRoute);

module.exports = appUsers;