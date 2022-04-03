//importing modules
const Tour = require('./../models/tour-model');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppErorr = require('./../utils/appError');
const AppError = require('./../utils/appError');

exports.updateTour = factory.updateOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours= factory.getAll(Tour);

exports.getMe = (req, res, next) =>{
    req.params.id = req.user.id;
    next();
}

// Apply middle wares
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingAverage,difficulty';
    next();
};

//Aggregation Pipeline Matching and Grouping
exports.getTourStats = catchAsync(async (req, res) => {

    const stats = await Tour.aggregate([{
            $match: {
                ratingsAverage: {
                    $gte: 4.5
                }
            }
        },
        {
            $group: {
                _id: {
                    $toUpper: '$difficulty'
                },
                num: {
                    $sum: 1
                },
                numRatings: {
                    $sum: '$ratingsQuantity'
                },
                avgRatings: {
                    $avg: '$ratingsAverage'
                },
                avgPrice: {
                    $avg: '$price'
                },
                minPrice: {
                    $min: '$price'
                },
                maxPrice: {
                    $max: '$price'
                }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});
//Aggregation Pipeline Unwinding and Projecting
exports.getMonthlyPlan = catchAsync(async (req, res) => {

    const year = req.params.year * 1;
    const plan = await Tour.aggregate([{
            //unconstruct api reuslt
            $unwind: '$startDates'
        },
        {
            //the query matched
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            //show fields that you want
            $group: {
                _id: {
                    $month: '$startDates'
                },
                numTourStart: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }

            }
        },
        {
            // add fields
            $addFields: {
                month: '$_id'
            }
        },
        { // 0 to hide , 1 to show
            $project: {
                _id: 0
            }
        },
        {
            //1 for Ascending , -1 for descending
            $sort: {
                numTourStart: 1
            }
        },
        {
            //limit the api result
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

// get tour within radius
// /tours-within/111/center/11,11/unit/mi
exports.getTourWithin = async (req, res, next) =>{

    const{ distance, latlng, unit } = req.params;
    const [lng, lat] = latlng.split(',');
    const radius = unit === 'mi' ? distance/ 3963.2 : distance/ 6378.1;
    
    if(!lat || !lng){
        next(
            new AppErorr('Please Enter lngittude and lattitude in format lng,lat.', 400)
        );
    }
    console.log(distance, lat, lng, unit)

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    
    res.status(200).json({
        status:'success',
        results: tours.length,
        data:{
            tours
        }
    });
}

//get distances to tours fom point
//distances/-115.570154,51.178456/unit/:mi
exports.getDistances = catchAsync( async(req, res, next)=>{

    const{ latlng, unit } = req.params;
    const [lng, lat] = latlng.split(',');
    
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  

    
    if(!lat || !lng){
        next(
            new AppError('Please Enter lngittude and lattitude in format lng,lat.', 400)
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near: {
                    type: 'point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },{
            $project: {
                distance: 1 , 
                name:1
            }
        }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            distances
        }
    });
});