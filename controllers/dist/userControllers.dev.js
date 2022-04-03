"use strict";

var User = require('./../models/user-model');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, allowedDate = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    allowedDate[_key - 1] = arguments[_key];
  }

  var newObj = {};
  Object.keys(obj).forEach(function (el) {
    if (allowedDate.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUser = catchAsync(function _callee(req, res) {
  var users;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.find());

        case 2:
          users = _context.sent;
          res.status(400).json({
            status: 'success',
            data: {
              users: users
            }
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.updateMe = catchAsync(function _callee2(req, res, next) {
  var filterBody, updateUser;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(req.body.password || req.body.confirmPassword)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", next(new AppError('this route can\'t update password go to /updateMyPassword', 400)));

        case 2:
          //filter out unwanted data 
          filterBody = filterObj(req.body, 'name', 'email'); //update user date

          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, filterBody, {
            "new": true,
            runValidators: true
          }));

        case 5:
          updateUser = _context2.sent;
          res.status(200).json({
            status: 'success',
            data: {
              user: updateUser
            }
          });

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.deleteMe = catchAsync(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            active: false
          }));

        case 2:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.getUser = catchAsync(function _callee4(req, res) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          res.status(500).json({
            status: 'not Defiend',
            message: 'Route not available yet'
          });

        case 1:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.updateUser = catchAsync(function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          res.status(500).json({
            status: 'not Defiend',
            message: 'Route not available yet'
          });

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.createUser = catchAsync(function _callee6(req, res) {
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          res.status(500).json({
            status: 'not Defiend',
            message: 'Route not available yet'
          });

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.deleteUser = catchAsync(function _callee7(req, res) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          res.status(500).json({
            status: 'not Defiend',
            message: 'Route not available yet'
          });

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
});