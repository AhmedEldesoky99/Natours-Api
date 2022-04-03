"use strict";

var _require = require('util'),
    promisify = _require.promisify;

var crypto = require('crypto');

var jwt = require('jsonwebtoken');

var AppError = require('./../utils/appError');

var sendEmail = require('./../utils/email');

var catchAsync = require('./../utils/catchAsync');

var User = require('./../models/user-model');

var SignInToken = function SignInToken(id) {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN
  });
};

var createSendToken = function createSendToken(user, statusCode, res) {
  var token = SignInToken(user.id);
  var cookieOprions = {
    expires: new Date(Date.now() * process.env.JWT_COOKIE_EXPIRED_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOprions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
}; // this method allow user to sign up


exports.signUp = catchAsync(function _callee(req, res, next) {
  var newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role
          }));

        case 2:
          newUser = _context.sent;
          createSendToken(newUser, 200, res);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}); // this method allow user to login

exports.login = catchAsync(function _callee2(req, res, next) {
  var _req$body, email, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password; //check if user don't enter email or password

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Please Enter Email and Password'), 400));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 5:
          user = _context2.sent;
          _context2.t0 = !user;

          if (_context2.t0) {
            _context2.next = 11;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 10:
          _context2.t0 = !_context2.sent;

        case 11:
          if (!_context2.t0) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Incorrect Email or Password', 401)));

        case 13:
          createSendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // this method protect Route from unautherization

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, decoded, currentUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // get token and check if there
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
          }

          if (!token) {
            next(new AppError('You are not login please login to get access', 401));
          } // varification token


          _context3.next = 4;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 4:
          decoded = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 7:
          currentUser = _context3.sent;

          if (currentUser) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", next(new AppError('the user belong to this token does not longer exist', 401)));

        case 10:
          if (!currentUser.changedPasswordAfter(decoded.iat)) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", next(new AppError('User recently change password please Login again to continue', 401)));

        case 12:
          //Grant access to protect route
          req.user = currentUser; //console.log(req.user)

          next();

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // start authorization
//this function to handle resouces between user by check user role

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You don\'t have permission to perform this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(function _callee4(req, res, next) {
  var user, resetToken, resetURL, message;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context4.sent;

          if (user) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new AppError('There is no user with this email address', 404)));

        case 5:
          //generate random reset token
          resetToken = user.createPasswordResetToken();
          _context4.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          //send token to user email
          resetURL = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/resetPassword/").concat(resetToken);
          message = "Forget your password !! visit this link to reset it \n    ".concat(resetURL, " \n    if you don't forget your password please ignore this email");
          _context4.prev = 10;
          _context4.next = 13;
          return regeneratorRuntime.awrap(sendEmail({
            email: user.email,
            subject: 'Your password reset token you have 10 minites to validate it ',
            message: message
          }));

        case 13:
          res.status(200).json({
            status: 'success',
            message: 'Token sent check your mail'
          });
          _context4.next = 23;
          break;

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](10);
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          _context4.next = 22;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 22:
          return _context4.abrupt("return", next(new AppError('Failed to send Email try again later', 500)));

        case 23:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[10, 16]]);
});
exports.resetPassword = catchAsync(function _callee5(req, res, next) {
  var hashedToken, user;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          //get the user based on the token
          hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
          _context5.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context5.sent;
          //if the token has no expired and there is user then change password
          user.password = req.body.password;
          user.confirmPassword = req.body.confirmPassword;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined; //save changes with validator

          user.save(); //send token and login

          createSendToken(user, 200, res);
          next();

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.updatePassword = catchAsync(function _callee6(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select('+password'));

        case 2:
          user = _context6.sent;
          _context6.next = 5;
          return regeneratorRuntime.awrap(user.correctPassword(req.body.currentPassword, user.password));

        case 5:
          if (_context6.sent) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", next(new AppError('Your current password is wrong', 401)));

        case 7:
          user.password = req.body.password;
          user.confirmPassword = req.body.confirmPassword;
          _context6.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          createSendToken(user, 200, res);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  });
});