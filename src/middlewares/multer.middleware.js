import multer from "multer";
//Isko as a middleware use karenge sirf un jagah jaha pe hme kuch upload karna hoga jaise image, file etc
const storage = multer.diskStorage({
  //diskstorage ka matlab hai ki hum file ko save karenge disk me
  destination: function (req, file, cb) {
    //destination me hum file ko kaha save karna chahte hai wo path denge
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //file ka original name save karenge
  },
});

export const upload = multer({ storage }); //upload variable me humne multer ka instance banaya hai jisme humne storage pass kiya hai
