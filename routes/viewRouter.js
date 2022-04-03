const express = require('express');

const router = express.Router();

const viewController = require('../controllers/viewControllers');


router.get('/overview', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm)
router.get('/web', viewController.web)

module.exports =router;