import { Router } from "express";
import multer, { diskStorage } from "multer";
import { extname } from "path";
import { create } from "../models/Places.model.js";
import {
  getPlaces,
  getPlace,
  updatePlace,
  deletePlace,
} from "../controllers/Places.controller.js";
const router = Router();

//Get Place Details
router.get("/", getPlaces);

//Create Place
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

router.post("/create", upload.single("file"), (req, res) => {
  create({
    file: req.file.filename,
    name: req.body.name,
    placeLocation: req.body.placeLocation,
    description: req.body.description,
  })
    .then((res) => res.json(res))
    .catch((err) => res.json(err));
});

//Get Hotel by ID
router.get("/:id", getPlace);

//Update Hotel
router.put("/edit/:id", updatePlace);

//Delete Hotel
router.delete("/delete/:id", deletePlace);

export default router;
