"use strict";

var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var crypto = require('crypto'); // start my schema


var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username requied'],
    maxLength: [50, 'Username must be less than 50 characters'],
    minLength: [5, 'Username must be more than 5 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  photo: {
    type: String
  },
  role: {
    type: String,
    "enum": ['user', 'guide', 'lead-guide', 'admin'],
    "default": 'user'
  },
  password: {
    type: String,
    required: [true, 'Please enter valid password'],
    minLength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function validator(el) {
        return el === this.password;
      },
      message: 'The passwords are different'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    "default": true,
    select: false
  }
}); // save() or create() this middleware work

userSchema.pre('save', function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified('password')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 12));

        case 4:
          this.password = _context.sent;
          //we don't need to store confirm password in db 
          this.confirmPassword = undefined;
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  return next();
});
userSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false
    }
  });
  next();
});

userSchema.methods.correctPassword = function _callee2(candidatePassword, userPassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(candidatePassword, userPassword));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    var changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changeTimestamp;
  }
};

userSchema.methods.createPasswordResetToken = function () {
  var resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

var User = mongoose.model('User', userSchema);
module.exports = User;