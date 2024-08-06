const jwt = require("jsonwebtoken");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const asyncHandler=require("../utils/asyncHandler");
const userModel = require("../models/userModel");

const verifyJwt=asyncHandler(async(req,res,next)=>{
    try {
        const token= req.cookies?.accessToken || req.header("Authorization"?.replace("Bearer ",""));
        if(!decoded){
            throw new ApiErrorHandler(401,"Unauthorizes Request")
        }
        const decoded= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await userModel.findById(decoded?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiErrorHandler(401,"invalid access token")
        }
        req.user=user;
        next();
    } catch (error) {
        throw new ApiErrorHandler(401,error?.message || "invalid access token")
    }

})

module.exports=verifyJwt