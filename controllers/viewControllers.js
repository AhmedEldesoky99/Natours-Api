const Tour = require('../models/tour-model');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async (req, res) => {

    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tour',
        tours
    });
});

exports.getTour =  catchAsync(async (req, res, next) => {
    
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path:'reviews',
        fields: 'review rating user '
    })

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req,res) =>{

    res.status(200).render('login', {
        title: 'login into your account'
    });
}

exports.web = (req,res) =>{

    res.status(200).render('web', {
        title: 'login into your account'
    });
}
