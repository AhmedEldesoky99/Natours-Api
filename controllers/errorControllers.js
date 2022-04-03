const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicatiedFields = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicatied value ${value} please use another value`;
    return new AppError(message, 400);
}

const handleValidatorErrorDB = err => {
    let errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid data input : ${errors.join('. ')}`;
    return new AppError(message, 400);

}

const handleJWTError = () => new AppError('Invalid token please login again', 401);

const hanleJWTExpired = () => new AppError('Your Token has expired please login again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {

    //operational error
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        //programming error
    } else {
        //log error
        console.error('Error...', err)
        //send error to client
        res.status(500).json({
            status: 'Error',
            message: 'somthing want wrong try again later'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // handle casterror 
        if (err.name === 'CastError') err = handleCastErrorDB(err);

        //handle duplicatied field (uniqe)
        if (err.code === 11000) err = handleDuplicatiedFields(err);

        //handle validation error
        if (err.name === 'ValidationError') err = handleValidatorErrorDB(err);

        //handle token error
        if (err.name === 'JsonWebTokenError') err = handleJWTError();

        //handle token expired
        if (err.name === 'TokenExpiredError') err = hanleJWTExpired();




        sendErrorProd(err, res);
    }
}