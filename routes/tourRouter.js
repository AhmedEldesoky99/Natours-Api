//importing express
const express = require('express');
const router = express.Router();

const tourControllers = require('../controllers/tourControllers');
const authControllers = require('../controllers/authControllers');
const reviewRoute = require('./reviewRouter');

router.use('/:tourId/reviews', reviewRoute);

router
    .route('/top-five-cheap')
    .get(tourControllers.aliasTopTours, tourControllers.getAllTours);

router
    .route('/monthly-plan/:year')
    .get(
        authControllers.protect,
        authControllers.restrictTo('admin','lead-guide', 'guide'),
        tourControllers.getMonthlyPlan);

router
    .route('/tour-stats')
    .get(tourControllers.getTourStats);

router
    .route('/')
    .get(tourControllers.getAllTours)
    .post(
         authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.createTour);

// /tours-within/111/center/11,11/unit/mi
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourControllers.getTourWithin);

///distances/-115.570154,51.178456/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

router
    .route('/:id')
    .get(tourControllers.getTour)
    .patch(
        authControllers.protect,
        authControllers.restrictTo('admin','lead-guide'),
        tourControllers.updateTour)
    .delete(
        authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.deleteTour
    );

module.exports = router;