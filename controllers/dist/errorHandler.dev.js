"use strict";

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
    sendErrorProd(err, res);
  }
};