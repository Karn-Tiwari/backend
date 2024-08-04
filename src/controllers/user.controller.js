import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //1. Get user details from frontend
  //2. Validate user details, Is empty or not
  //3. Check if user already exists:checking by username, and email
  //4. If user exists, send error message to frontend
  //5. check for images,check for avatar
  //6. upload them to cloudinary, avatar=>isme bhi dekhenge ki multer pe upload karenge uske baad waha se cloudinary pe upload karenge aur response url k form me ayega
  //7. If user does not exist, create user object - create entry in Database
  //8. remove password and refresh token field from response
  //9. check for user creation
  //10. Send success message to frontend and return response

  // const { fullName, email, username, password } = await req.body; //User details
  // console.log("email", email);
  const { fullName, email, username, password } = req.body;
  console.log("email", email);
  //Ya to iss wale syntax k sath sare validation check kare ya phir ek naya syntax k sath sabko ek sasth check kare
  // if (fullName === "") {
  //   throw new ApiError(400, "Full Name is required");
  // }
  //1. and 2.
  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }
  //3. and 4.
  const existedUser = User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(409, "User with email and username already exists");
  }
  //5.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  //6
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  //Yaha pe humne password aur refresh token ko remove kiya hai response se
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
