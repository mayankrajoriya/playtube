const mongoose=require("mongoose");
const  mongooseAggregatePaginate  = require("mongoose-aggregate-paginate-v2");


const videoSchema=new mongoose.Schema({
     thumbnail:{
        type:String,
        required:true
     },
     title:{
        type:String,
        required:true
     },
     description:{
        type:String,
        required:true
     },
     duration:{
        type:Number,
        required:true
     },
     views:{
        type:Number,
        default:0
     },
     isPublished:{
        type:Boolean,
        default:true
     },
     owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
     },
     videoFile:{
        type:String,
        required:true
     }
},
{
    timestamps:true
})
videoSchema.plugin(mongooseAggregatePaginate)

module.exports = mongoose.model("Video",videoSchema)