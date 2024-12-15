import { Router } from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
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
);
router.post("/edit-user", authMiddleware, editUser);

export default router;
