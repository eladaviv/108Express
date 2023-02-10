const User = require('../models/user');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // for auth check
const { errorHandler } = require('../helpers/dbErrorHandler');
const mongoose = require('mongoose');

require('dotenv').config();

exports.signup = async (req, res) => {
  try {
    const { name, email, firebase_userId } = req.body;
    const user = new User({
      firebase_userId:firebase_userId,
      name: name,
      email: email,
    });
    await user.save();
    res.status(201).json({
      msg:"success",
    });
  } catch (error) {
    console.log("in here");
    console.log(error);
  }

};

exports.signin = (req, res) => {
  // find the user based on email
  const { email, expiresIn,idToken,localId } = req.body;
  User.findOne({ firebase_userId:localId }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }
    // if user found make sure the email and password match
    // create authenticate method in user model
    // if (!user.authenticate(password)) {
    //   return res.status(401).json({
    //     error: "Email and password didn't match",
    //   });
    // }
    // generate a signed token with user id and secret
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET
    );
    // persist the token as 't' in cookie with expiry date
    res.cookie('t', token, { expire: expiresIn });
    // return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('t');
  res.json({ message: 'Signout success' });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  // algorithms: ['RS256'],
  userProperty: 'auth',
});

exports.isAuth = (req, res, next) => {
  console.log("req.profile = ",req.profile);
  console.log("req.auth = ",req.auth);
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'Admin resource! Access denied',
    });
  }
  next();
};
