const asyncHandler = require("../utils/asyncHandler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/userModel");
const uploadOnCloudinary = require("../utils/cloudinary");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrorHandler(500, "Something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;

  if (
    [fullname, username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiErrorHandler(400, "All fields are required");
  }

  const isUserExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (isUserExist) {
    throw new ApiErrorHandler(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiErrorHandler(400, "Profile Image is required");
  }
  let coverImageLocalPath;
  if (
    req.file &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
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
    throw new ApiErrorHandler(504, "Something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, IsUserCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiErrorHandler(400, "Username or email is required");
  }
  const isUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (!isUser) {
    throw new ApiErrorHandler(404, "User does not exist");
  }
  const isPasswordValid = await isUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiErrorHandler(401, "Invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    isUser._id
  );
  const loggedInUser = await userModel
    .findById(isUser._id)
    .select("-password -refreshToken");

  // Step to make cookie secure
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // Step to make cookie secure
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

module.exports = { registerUser, loginUser, logoutUser };
