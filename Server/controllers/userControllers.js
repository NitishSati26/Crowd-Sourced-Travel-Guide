import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import { log } from "console";

// import {
//   findOne,
//   create,
//   findById,
//   findByIdAndUpdate,
//   find,
// } from "../models/userModel.js";
// import HttpError from "../models/errorModel.js";

/*=========================Register a new user =============*/
// POST : api/users/register

//unprotected
const registerUser = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;

    // Validate required fields
    if (!name || !email || !password || !password2) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newEmail = email?.toLowerCase() || "";

    // Check if email already exists
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Check password length
    const MIN_PASSWORD_LENGTH = 6;
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password should be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }

    // Check if passwords match
    if (password !== password2) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPass,
    });

    // Success response
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ message: "Invalid email or password" });
    }
    const newEmail = email.toLowerCase();

    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return res.status(422).json({ message: "Invalid credentials" });
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(422).json({ message: "Invalid Credentials" });
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    return res.status(422).json({ message: error.message });
  }
};

// /*=========================User profile =============*/
// // POST : api/users/:id
// // protected
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(422).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(422).json({ message: error.message });
  }
};

// /*======================== change user avatar =============*/
// // POST : api/users/change-avatar
// // protected
// const changeAvatar = async (req, res, next) => {
//   try {
//     if (!req.files.avatar) {
//       return res.status(422).json({ message: "Please choose an image. " });
//     }

//     //find the user from database
//     const user = await User.findById(req.user.id);

//     //delete old avatar if exists
//     if (user.avatar) {
//       unlink(join(__dirname, "..", "uploads", user.avatar), (err) => {
//         if (err) {
//           return res.status(422).json({ message: err.message });
//         }
//       });
//     }

//     // Validate file type
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(avatar.mimetype)) {
//       return res.status(422).json({
//         message: "Invalid file type. Please upload a JPG or PNG image.",
//       });
//     }

//     const { avatar } = req.files;
//     //check file size
//     if (avatar.size > 500000) {
//       return res.status(422).json({
//         message: "Profile picture is too big. Should be less than 500kb.",
//       });
//     }

//     let fileName;
//     fileName = avatar.name;
//     let splittedFilename = fileName.split(".");
//     let newFilename =
//       splittedFilename[0] +
//       uuid() +
//       "." +
//       splittedFilename[splittedFilename.length - 1];
//     avatar.mv(join(__dirname, "..", "uploads", newFilename), async (err) => {
//       if (err) {
//         return res.status(422).json({ message: err.message });
//       }

//       const updatedAvatar = await User.findByIdAndUpdate(
//         req.user.id,
//         { avatar: newFilename },
//         { new: true }
//       );
//       if (!updatedAvatar) {
//         return res.status(422).json({ message: "Avatar couldn't be changed" });
//       }
//       res.status(200).json(updatedAvatar);
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// Utility for validating files
// const validateFile = (file) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//   if (!allowedTypes.includes(file.mimetype)) {
//     throw new Error("Invalid file type. Please upload a JPG or PNG image.");
//   }
//   if (file.size > 500000) {
//     throw new Error("File size too large. Should be less than 500 KB.");
//   }
// };

// Change Avatar Handler
const changeAvatar = async (req, res) => {
  try {
    // Debugging: Check if files are received
    // console.log("req.files:", req.files);

    const avatar = req.file;
    console.log(avatar);

    if (!avatar) {
      return res.status(422).json({ message: "Please choose an image." });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    console.log("File type:", avatar.mimetype);
    if (!allowedTypes.includes(avatar.mimetype)) {
      return res.status(422).json({
        message: "Invalid file type. Please upload a JPG or PNG image.",
      });
    }

    // Validate file size
    if (avatar.size > 500000) {
      return res.status(422).json({
        message: "Profile picture is too big. Should be less than 500KB.",
      });
    }

    // Upload in Database
    const avatarPath = avatar.path; // Get the path of the uploaded file
    console.log(`${avatarPath}`);

    // Save the path in the database (for example, in the user model)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(422).json({ message: "Avatar couldn't be changed" });
    }

    res.status(200).json(updatedUser);

    // Continue with file handling...
  } catch (error) {
    console.error("Error in changeAvatar:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// /*========================= edit user details from profile =============*/
// // POST : api/users/edit-user
// //protected
// const editUser = async (req, res, next) => {
//   try {
//     const { name, email, currentPassword, newPassword, confirmNewPassword } =
//       req.body;
//     if (!name || !email || !currentPassword || !newPassword) {
//       return next(new HttpError("Fill in all fields.", 422));
//     }

//     //get user from database
//     const user = await findById(req.user.id);
//     if (!user) {
//       return next(new HttpError("User not found.", 403));
//     }

//     //make sure new email doesn't already exist
//     const emailExists = await findOne({ email });

//     //we want to update other details with/without changing the email (which is a uniqueid because we use it to login).
//     if (emailExists && emailExists._id != req.user.id) {
//       return next(new HttpError("Email already exist.", 422));
//     }

//     // compare current password to database password
//     const validateUserPassword = await compare(currentPassword, user.password);
//     if (!validateUserPassword) {
//       return next(new HttpError("Invalid current password", 422));
//     }

//     // compare new passwords
//     if (newPassword !== confirmNewPassword) {
//       return next(new HttpError("New password do not match.", 422));
//     }

//     //hash new password
//     const salt = await genSalt(10);
//     const hash = await _hash(newPassword, salt);

//     //update user info in database
//     const newInfo = await findByIdAndUpdate(
//       req.user.id,
//       { name, email, password: hash },
//       { new: true }
//     );
//     res.status(200).json(newInfo);
//   } catch (error) {
//     return next(new HttpError(error));
//   }
// };

// /*========================= Get Authors =============*/
// // POST : api/users/authors
// //unprotected
// const getAuthors = async (req, res, next) => {
//   try {
//     const authors = await find().select("-password"); //.select('-password'); password ek ganna epa kiyala kiyanne
//     res.json(authors);
//   } catch (error) {
//     return next(new HttpError(error));
//   }
// };

export { registerUser, loginUser, getUser, changeAvatar };
//  editUser, getAuthors };
