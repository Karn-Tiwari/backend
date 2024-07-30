import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//CORS k liye
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//urlencoded k liye limit set kiya hai ye na ho ki unlimited json aa jaye
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
export default app;
