const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    const decodedToken = jwt.verify(token, 'secret_for_token');
    req.userData = { 
      email: decodedToken.email, 
      userId: decodedToken.userId
    }
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Auth failed, token incorrect',
      error
    })
  }
}