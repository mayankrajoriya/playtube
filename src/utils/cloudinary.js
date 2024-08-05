const cloudinary = require('cloudinary').v2;
const fs = require("fs");


  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload an image

  const uploadOnCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) return "could not find file path";
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      console.log("file is uploaded successfully", response.url);
      return response;
    } catch (error) {
      fs.unlinkSync(localFilePath);
      return null;
    }
  };
module.exports=cloudinary