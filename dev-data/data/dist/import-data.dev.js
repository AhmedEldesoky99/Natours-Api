"use strict";

//importing modules
var fs = require('fs');

var Tour = require('../../models/tour-model'); //importing db


var mongoose = require('mongoose'); //importing config


var dotenv = require('dotenv');

dotenv.config({
  path: './config.env'
});
var db = process.env.DATABASE_LOCAL;
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  return console.log('Database is connected...');
}); //Read json File

var tours = JSON.parse(fs.readFileSync("".concat(__dirname, "/tours-simple.json"), 'utf-8'));
console.log(tours); //import data into db

var importData = function importData() {
  return regeneratorRuntime.async(function importData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Tour.create(tours));

        case 3:
          console.log('DB Successfly Loaded');
          _context.next = 9;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);

        case 9:
          process.exit();

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

var deleteDara = function deleteDara() {
  return regeneratorRuntime.async(function deleteDara$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Tour.deleteMany());

        case 3:
          console.log('DB Successfuly Deleted');
          _context2.next = 9;
          break;

        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 9:
          process.exit();

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

console.log(proccess.argv);