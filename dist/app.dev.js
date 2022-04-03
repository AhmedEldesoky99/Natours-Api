"use strict";

var express = require('express');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp'); //error modules


var errorControllers = require('./controllers/errorControllers');

var AppError = require('./utils/appError'); // route modules


var tourRouter = require('./routes/tourRouter');

var userRouter = require('./routes/userRouter');

var app = express();
/*********start global middleware**************/
//set security http header

app.use(helmet()); //develoing logging

if (process.env.NODE_ENV === 'development') {
  var morgan = require('morgan');

  app.use(morgan('dev'));
} //limit request from same ip


var limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from the same device try again after a hour'
});
app.use('/api', limiter); //body parser reading data from body into req.body

app.use(express.json({
  limit: '10kb'
})); // Data sanitization against noSql Query

app.use(mongoSanitize()); // Data sanitiazation against xss attackers

app.use(xss()); // prevent parameter pollution

app.use(hpp(['ratingsAverage', 'ratingsQuantity', 'duration', 'maxGroupSize', 'difficulty', 'price'])); //serving static files

app.use(express["static"]("".concat(__dirname, "/public"))); // test middleware 

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
}); //routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); //handle url errors

app.all('*', function (req, res, next) {
  next(new AppError("can't find ".concat(req.originalUrl, " on this server"), 404));
});
app.use(errorControllers); //export module

module.exports = app;