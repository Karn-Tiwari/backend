import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//CORS k
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//urlencoded ki limit set hai ye na ho ki unlimited json aa
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes import
import router from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", router);

//http://localhost:5000/api/v1/users/register
export { app };
