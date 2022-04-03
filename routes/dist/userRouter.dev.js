"use strict";

//importing express
var express = require('express');

var router = express.Router(); //import files

var userControllers = require('../controllers/userControllers');

var authControllers = require('../controllers/authControllers');

router.post('/signup', authControllers.signUp);
router.post('/login', authControllers.login);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);
router.patch('/updateMyPassword', authControllers.protect, authControllers.updatePassword);
router.patch('/updateMe', authControllers.protect, userControllers.updateMe);
router.patch('/deleteMe', authControllers.protect, userControllers.deleteMe);
router.route('/').get(userControllers.getAllUser).post(userControllers.createUser);
router.route('/:id').patch(userControllers.updateUser).get(userControllers.getUser)["delete"](userControllers.deleteUser);
module.exports = router;