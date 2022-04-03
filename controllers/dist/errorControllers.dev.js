"use strict";

var AppError = require('./../utils/appError');

var handleCastErrorDB = function handleCastErrorDB(err) {
  var message = "Invalid ".concat(err.path, ": ").concat(err.value);
  return new AppError(message, 400);
};

var handleDuplicatiedFields = function handleDuplicatiedFields(err) {
  var value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  var message = "Duplicatied value ".concat(value, " please use another value");
  return new AppError(message, 400);
};

var handleValidatorErrorDB = function handleValidatorErrorDB(err) {
  var errors = Object.values(err.errors).map(function (el) {
    return el.message;
  });
  var message = "Invalid data input : ".concat(errors.join('. '));
  return new AppError(message, 400);
};

var handleJWTError = function handleJWTError() {
  return new AppError('Invalid token please login again', 401);
};

var hanleJWTExpired = function hanleJWTExpired() {
  return new AppError('Your Token has expired please login again', 401);
};

var sendErrorDev = function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

var sendErrorProd = function sendErrorProd(err, res) {
  //operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    }); //programming error
  } else {
    //log error
    console.error('Error...', err); //send error to client

    res.status(500).json({
      status: 'Error',
      message: 'somthing want wrong try again later'
    });
  }
};

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // handle casterror 
    if (err.name === 'CastError') err = handleCastErrorDB(err); //handle duplicatied field (uniqe)

    if (err.code === 11000) err = handleDuplicatiedFields(err); //handle validation error

    if (err.name === 'ValidationError') err = handleValidatorErrorDB(err); //handle token error

    if (err.name === 'JsonWebTokenError') err = handleJWTError(); //handle token expired

    if (err.name === 'TokenExpiredError') err = hanleJWTExpired();
    sendErrorProd(err, res);
  }
};