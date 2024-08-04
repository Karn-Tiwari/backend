import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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
  const { fullName, email, userName, password } = req.body;
  // console.log("email", email);
  //Ya to iss wale syntax k sath sare validation check kare ya phir ek naya syntax k sath sabko ek sasth check kare
  // if (fullName === "") {
  //   throw new ApiError(400, "Full Name is required");
  // }
  //1. and 2.

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // if (!fullName || !email || !username || !password) {
  //   throw new ApiError(400, "All fields are required");
  // }
  //3. and 4.
  const existedUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existedUser) {
    throw new ApiError(409, "User with email and username already exists");
  }
  //5.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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
    userName: userName.toLowerCase(),
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

const loginUser = asyncHandler(async (req, res) => {
  //Data lenge req.body se
  //userName ya email se login karwayenge
  //find the user
  //password check
  //Generating access and refresh token and giving to the user
  //send secure cookie

  const { email, userName, password } = await req.body;

  if (!userName || !email) {
    throw new ApiError(400, "userName or email is required");
  }
  //Model ki help se findOne call karna iska matlab jo bhi hme pehle mill jaye chahe wo email ho ya userName ho

  const user = await User.findOne({
    $nor: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export { registerUser, loginUser };
