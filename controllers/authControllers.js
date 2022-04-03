const {
    promisify
} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/user-model');

const SignInToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRED_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = SignInToken(user.id);

    const cookieOprions = {
        expires: new Date(
            Date.now() * process.env.JWT_COOKIE_EXPIRED_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOprions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
};
// this method allow user to sign up
exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role
    });
    createSendToken(newUser, 200, res);
});
// this method allow user to login
exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    //check if user don't enter email or password
    if (!email || !password) {
        return next(new AppError('Please Enter Email and Password'), 400);
    }
    //check if user exist and password correct
    const user = await User.findOne({
        email
    }).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect Email or Password', 401));
    }

    createSendToken(user, 200, res);
});

// this method protect Route from unautherization
exports.protect = catchAsync(async (req, res, next) => {
    // get token and check if there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        next(new AppError('You are not login please login to get access', 401));
    }else if(req.cookie.jwt){
        token = req.cookie.jwt;
    }
    // varification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    //check if user still exist
    const currentUser = await User.findById(decoded.id);
    //console.log(decoded.id)
    if (!currentUser) {
        return next(new AppError('the user belong to this token does not longer exist', 401));
    }

    //check if user change password after token was issused

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently change password please Login again to continue', 401)
        );
    }
    //Grant access to protect route
    req.user = currentUser;
    //console.log(req.user)
    next();
});

// start authorization

//this function to handle resouces between user by check user role
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don\'t have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {

    //get the user based on posted email
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }

    //generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });
    //send token to user email

    const resetURL =
        `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forget your password !! visit this link to reset it 
    ${resetURL} 
    if you don't forget your password please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token you have 10 minites to validate it ',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent check your mail'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(new AppError('Failed to send Email try again later', 500))
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    //get the user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });
    //if the token has no expired and there is user then change password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //save changes with validator
    user.save();

    //send token and login
    createSendToken(user, 200, res);
    next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //check if posted password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    createSendToken(user, 200, res);
});