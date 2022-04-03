"use strict";

//importing modules
var Tour = require('./../models/tour-model');

var APIFeatures = require('./../utils/apiFeatures');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

exports.createTour = catchAsync(function _callee(req, res) {
  var newTour;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.create(req.body));

        case 2:
          newTour = _context.sent;
          res.status(201).json({
            status: 'success',
            date: {
              tour: newTour
            }
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Apply middle wares

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,difficulty';
  next();
};

exports.getAllTours = catchAsync(function _callee2(req, res) {
  var features, tours;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          /***********************build query**********************/

          /*1)start filter
              const queryObj = {...req.query};
              const excludedFields = ['page','sort','limit','fields'];
              excludedFields.forEach(el => delete queryObj[el]);
                //advanced filter
              let queryStr = JSON.stringify(queryObj);
              queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match=>`$${match}`);
              
              //query result
              let query = Tour.find(JSON.parse(queryStr));
              
              //2) start sorting
              if(req.query.sort){
                  const sortBy = req.query.sort.split(',').join(' ');
                  query = query.sort(sortBy);
              }
              else{
                  query = query.sort('price')
              }
                //3) start limiting
              if(req.query.fields){
                  const fields = req.query.fields.split(',').join(' ');
                  query = query.select(fields);
              }
              else{
                  query = query.select('-__v');
              }
                //start pagenation
              const page = req.query.page * 1 || 1;
              const limit = req.query.limit * 1 || 100;
              const skip = (page - 1 ) * limit;
                query = query.skip(skip).limit(limit);
                if(req.query.page){
                  const numTours = await Tour.countDocuments();
                  if(skip >= numTours){
                      throw new Error('The page doesn\'t exist');
                  }
              }
          */
          // Excute query
          features = new APIFeatures(Tour.find(), req.query).filter().sorting().limit().pagenation();
          _context2.next = 3;
          return regeneratorRuntime.awrap(features.query);

        case 3:
          tours = _context2.sent;
          //send response
          res.status(200).json({
            status: 'sucess',
            result: tours.length,
            data: {
              tours: tours
            }
          });

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.getTour = catchAsync(function _callee3(req, res, next) {
  var tour;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Tour.findById(req.params.id));

        case 2:
          tour = _context3.sent;

          if (tour) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", next(new AppError('No tour found with that id', 404)));

        case 5:
          res.status(200).json({
            status: 'success',
            data: {
              tour: tour
            }
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.updateTour = catchAsync(function _callee4(req, res, next) {
  var tour;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Tour.findByIdAndUpdate(req.params.id, req.body, {
            "new": true,
            runValidators: true
          }));

        case 2:
          tour = _context4.sent;

          if (tour) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new AppError('No tour found with that id', 404)));

        case 5:
          res.status(200).json({
            status: 'success',
            data: {
              tour: tour
            }
          });

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.deleteTour = catchAsync(function _callee5(req, res, next) {
  var tour;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Tour.findByIdAndDelete(req.params.id));

        case 2:
          tour = _context5.sent;

          if (tour) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError('No tour found with that id', 404)));

        case 5:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 6:
        case "end":
          return _context5.stop();
      }
    }
  });
}); //Aggregation Pipeline Matching and Grouping

exports.getTourStats = catchAsync(function _callee6(req, res) {
  var stats;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $match: {
              ratingsAverage: {
                $gte: 4.5
              }
            }
          }, {
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
          }, {
            $sort: {
              avgPrice: 1
            }
          }]));

        case 2:
          stats = _context6.sent;
          res.status(200).json({
            status: 'success',
            data: {
              stats: stats
            }
          });

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
}); //Aggregation Pipeline Unwinding and Projecting

exports.getMonthlyPlan = catchAsync(function _callee7(req, res) {
  var year, plan;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          year = req.params.year * 1;
          _context7.next = 3;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            //unconstruct api reuslt
            $unwind: '$startDates'
          }, {
            //the query matched
            $match: {
              startDates: {
                $gte: new Date("".concat(year, "-01-01")),
                $lte: new Date("".concat(year, "-12-31"))
              }
            }
          }, {
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
          }, {
            // add fields
            $addFields: {
              month: '$_id'
            }
          }, {
            // 0 to hide , 1 to show
            $project: {
              _id: 0
            }
          }, {
            //1 for Ascending , -1 for descending
            $sort: {
              numTourStart: 1
            }
          }, {
            //limit the api result
            $limit: 12
          }]));

        case 3:
          plan = _context7.sent;
          res.status(200).json({
            status: 'success',
            data: {
              plan: plan
            }
          });

        case 5:
        case "end":
          return _context7.stop();
      }
    }
  });
});