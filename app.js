const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
//error modules
const errorControllers = require('./controllers/errorControllers');
const AppError = require('./utils/appError');
// route modules
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/*********start global middleware**************/

//serving static files
app.use(express.static( path.join(__dirname, 'public') ) );


//set security http header
app.use(helmet());

//develoing logging
if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

//limit request from same ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from the same device try again after a hour'
});
app.use('/api', limiter);

//body parser reading data from body into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());

// Data sanitization against noSql Query
app.use(mongoSanitize());

// Data sanitiazation against xss attackers
app.use(xss());

// prevent parameter pollution
app.use(hpp([
    'ratingsAverage',
    'ratingsQuantity',
    'duration',
    'maxGroupSize',
    'difficulty',
    'price'
]));

// test middleware 
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//handle url errors
app.all('*', (req, res, next) => {
    next(new AppError(`can\'t find ${req.originalUrl} on this server`, 404));
});

app.use(errorControllers);

//export module
module.exports = app;