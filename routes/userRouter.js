//importing express
const express = require('express');
const router = express.Router();
//import files
const userControllers = require('../controllers/userControllers');
const authControllers = require('../controllers/authControllers');

router.post('/signup', authControllers.signUp);
router.post('/login', authControllers.login);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

//after this middleware all routes will be protected
router.use(authControllers.protect)
router.patch('/updateMyPassword', authControllers.updatePassword);
router.patch('/updateMe', userControllers.updateMe);
router.patch('/deleteMe', userControllers.deleteMe);
router.get('/me', userControllers.getMe, userControllers.getUser);

//aftee this middleware all routes will use by admin only
router.use(authControllers.restrictTo('admin'));

router
    .route('/')
    .get(userControllers.getAllUsers)
    .post(userControllers.createUser);

router
    .route('/:id')
    .patch(userControllers.updateUser)
    .get(userControllers.getUser)
    .delete(userControllers.deleteUser);

module.exports = router;