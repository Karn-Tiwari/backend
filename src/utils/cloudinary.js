import dotenv from "dotenv";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
// Import cloudinary

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ye function hai jo image ko upload karega cloudinary me
const uploadOnCloudinary = async (file) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully on cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Remove the locally saved temparory file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary }; //Export the function to use it in other files
