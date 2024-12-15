import { Router } from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
} from "../controllers/userControllers.js";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";

// import {
//   registerUser,
//   // loginUser,
//   // getUser,
//   // changeAvatar,
//   // editUser,
//   // getAuthors,
// } from "../controllers/userControllers.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
// router.get("/", getAuthors);
// router.post("/change-avatar", authMiddleware, changeAvatar);

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Use the middleware for specific routes
router.post(
  "/change-avatar",
  authMiddleware,
  upload.single("avatar"),
  changeAvatar
  // async (req, res, next) => {
  //   // console.log("File uploaded:", req.file); // Check if the file is in req.file
  //   if (req.fileValidationError) {
  //     return res.status(400).send(req.fileValidationError);
  //   }
  //   if (!req.file) {
  //     return res.status(400).json({ message: "No file uploaded" });
  //   }

  //   // console.log("File uploaded:", req.file); // Check the uploaded file
  //   const avatarPath = req.file.path; // Get the path of the uploaded file

  //   const updatedUser = await User.findByIdAndUpdate(
  //     req.user.id,
  //     { avatar: avatarPath },
  //     { new: true }
  //   );

  //   if (!updatedUser) {
  //     return res.status(422).json({ message: "Avatar couldn't be changed" });
  //   }

  //   res
  //     .status(200)
  //     .json({ message: "File Uploaded Successfully", updatedUser });
  // }
);
// router.patch("/edit-user", authMiddleware, editUser);

export default router;
