const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./user-model')

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'A tour must have a name'],
        unique:true,
        trim:true,
        maxLength: [40, 'A name must be less or equal 40 charcters'],
        minLength: [5, 'A name must be more or equal 5 charcters']
    },
    slug: String,
    duration:{
        type:Number,
        required: [true, 'A tour must have a duration']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum:{
            values:['easy', 'meduim' , 'difficult'],
            message: ['difficulty is either : easy, medium , hard']
        }
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a group size']
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min: [1, 'Rating must be above 1 '],
        max: [5, 'Rating must be below 5'],
        set: val => Math.round( val * 10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    summary:{
        type:String,
        required:[true, 'A tour must have a description'],
        trim: true
    },
    description :{
        type:String,
        trim:true
    },
    price:{
        type:Number,
        required:[true, 'A tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            },
            message:'Discount must be less price'
        }
    },
    imageCover:{
        type:String,
        required:[true, 'A Tour must have image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default: Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type: Boolean,
        default:false
    },
    startLocation:{
        type:{
          type: String,
          default: 'Point',
          enum: ['Point']  
        },
        coordinates: [Number],
        address: String,
        description: String
        
    },
    locations:[
        {
            type:{
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinaties:[ Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    /*
    Embeding
    guides: Array
    */
   //reference
   guides: [
       {
           type: mongoose.Schema.ObjectId,
           ref : 'User'
       }
   ]
    
},{
    toJSON:{ virtuals: true},
    toObject:{ virtuals: true}
});

//start index
tourSchema.index({ price: -1, ratingsAverage:1 });
tourSchema.index({ slug: 1});
tourSchema.index({ startLocation: '2dsphere'})

// start virtuals
tourSchema.virtual('duration-in-week').get(function(){
    return this.duration/7;
});

tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//Document Middleware : runs before create() , save()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower:true});
    next();
});

// Document Middleware : runs after all pre excution
/*
tourSchema.post('save', function(doc, next) {
    //content
    next();
});
*/

// Query Middleware
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour : { $ne : true} });
    next();
});
//reference
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    });
    next();
});
//embeding
/*
tourSchema.pre('save', async function(next) {
    const guidePromises = this.guides.map( async id => await User.findById(id) );
    this.guides = await Promise.all(guidePromises)
    next();
});
*/
/*
tourSchema.post(/^find/, function(docs, next) {
    //content
    next();
});
*/

//Aggregation middleware
/*
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour : { $ne : true } } });
    next();
});
*/
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;