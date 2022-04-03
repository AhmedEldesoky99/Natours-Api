"use strict";

var mongoose = require('mongoose');

var slugify = require('slugify'); //const validator = require('validator');


var tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxLength: [40, 'A name must be less or equal 40 charcters'],
    minLength: [5, 'A name must be more or equal 5 charcters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    "enum": {
      values: ['easy', 'meduim', 'difficult'],
      message: ['difficulty is either : easy, medium , hard']
    }
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  ratingsAverage: {
    type: Number,
    "default": 4.5,
    min: [1, 'Rating must be above 1 '],
    max: [5, 'Rating must be below 5']
  },
  ratingsQuantity: {
    type: Number,
    "default": 0
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a description'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function validator(val) {
        return val < this.price;
      },
      message: 'Discount must be less price'
    }
  },
  imageCover: {
    type: String,
    required: [true, 'A Tour must have image']
  },
  images: [String],
  createdAt: {
    type: Date,
    "default": Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    "default": false
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});
tourSchema.virtual('duration-in-week').get(function () {
  return this.duration / 7;
}); //Document Middleware : runs before create() , save()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
}); // Document Middleware : runs after all pre excution

/*
tourSchema.post('save', function(doc, next) {
    //content
    next();
});
*/
// Query Middleware

tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true
    }
  });
  next();
});
/*
tourSchema.post(/^find/, function(docs, next) {
    //content
    next();
});
*/
//Aggregation middleware

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true
      }
    }
  });
  next();
});
var Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;