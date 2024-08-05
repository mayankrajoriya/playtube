const asyncHandler = require("../utils/asyncHandler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/userModel");
const uploadONCloudinary = require("../utils/cloudinary");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;

  if (
    [fullname, username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiErrorHandler(400, "All field are required");
  }

  const isUserExist = userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (isUserExist) {
    throw new ApiErrorHandler(409, "user already exists");
  }
  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath) {
    throw new ApiErrorHandler(400, "Profile Image is required");
  }
  const avatar = await uploadONCloudinary(avatarLocalPath);
  const coverImage = await uploadONCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiErrorHandler(400, "Profile Image is required");
  }
  const createUser = await userModel.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username,
    password,
  });
  const IsUserCreated = await userModel
    .findById(createUser._id)
    .select("-password -refreshToken");

  if (!IsUserCreated) {
    throw new ApiErrorHandler(504, "something went wrong ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, IsUserCreated, "User registered Successfully"));
});

module.exports = registerUser;
