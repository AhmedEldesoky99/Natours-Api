const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// start my schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Username requied'],
        maxLength: [50, 'Username must be less than 50 characters'],
        minLength: [5, 'Username must be more than 5 characters']

    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter valid password'],
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'The passwords are different'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
// save() or create() this middleware work

userSchema.pre('save', async function (next) {
    //if user not modify password
    if (!this.isModified('password')) return next();
    //if password modified
    this.password = await bcrypt.hash(this.password, 12);
    //we don't need to store confirm password in db 
    this.confirmPassword = undefined;

    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    return next();
});

userSchema.pre(/^find/, function (next) {
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changeTimestamp;
    }
}

userSchema.methods.createPasswordResetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;