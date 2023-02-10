const mongoose = require('mongoose');
// const crypto = require('crypto');
// const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    firebase_userId:String,
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
   
    about: {
      type: String,
      trim: true,
    },
  
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
