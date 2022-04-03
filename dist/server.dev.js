"use strict";

//importing db
var mongoose = require('mongoose'); //importing config


var dotenv = require('dotenv');

dotenv.config({
  path: './config.env'
}); // importing modules

var app = require('./app');

var db = process.env.DATABASE_LOCAL;
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  return console.log('Database is connected...');
});
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("App is listening on port ".concat(port, "..."));
});
process.on('unhandledRejection', function (err) {
  cosnole.log(err.name, err.message);
  console.log('Unhandled Rejection... Shutting down ');
  server.close(function () {
    process.exit(1);
  });
});