// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./env" });

const PORT = process.env.PORT || 8000;
//Connect mongoDb and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port :${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed : ", err);
  });
// // Connect to MongoDB ye ek IFFIII function jo immediately execute hai
// // ;(async () => {})();
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("Error: ", error);
//       throw error;
//     });
//     app.listen(3000, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error: ", error);
//     throw error;
//   }
// })();
