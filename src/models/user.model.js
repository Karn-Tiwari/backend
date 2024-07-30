import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // index true karne se hum chahte hai ki ye mere database k search me aa jaye haan but ye costly hota hai iseliye dhyan se rakhna chahiye
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url use karenge
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url use karenge
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToke: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ye method humne inject kiya hai userSchema ki jab bhi password me koi changement ho tab usko save hone se pehle bcrypt kardo matlab hash value me convert kardo
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ye custom method hai jo humne inject kiya hai userSchema me jo ye check karega ki password jo user enter kar raha hai wo sahi hai ya nahi
// Normally true or false me btata hai
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname,
  }),
    process.env.ACCESS_TOKEN_SECRET,
    {
      expireIn: process.env.ACCESS_TOKEN_EXPIRY,
    };
};

userSchema.methods.generateRefereshToken = function () {
  jwt.sign({
    _id: this._id,
  }),
    process.env.REFERSH_TOKEN_SECRET,
    {
      expireIn: process.env.REFERESH_TOKEN_EXPIRY,
    };
};
export const User = mongoose.model("User", userSchema);
