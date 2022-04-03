"use strict";

//importing express
var express = require('express');

var router = express.Router(); //importing controllers

var tourControllers = require('../controllers/tourControllers');

router.route('/top-five-cheap').get(tourControllers.aliasTopTours, tourControllers.getAllTours);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);
router.route('/tour-stats').get(tourControllers.getTourStats);
router.route('/').get(tourControllers.getAllTours).post(tourControllers.createTour);
router.route('/:id').get(tourControllers.getTour).patch(tourControllers.updateTour)["delete"](tourControllers.deleteTour);
module.exports = router;