import { find, findById, findByIdAndDelete } from "../models/Places.model.js";

//Get Places
const getPlaces = (req, res) => {
  find()
    .then((Place) => res.json(Place))
    .catch((err) => res.json(err));
};

//Get Places by ID
const getPlace = (req, res) => {
  findById(req.params.id)
    .then((Place) => res.status(200).json(Place))
    .catch((err) => {
      res.status(400).json({ message: err });
    });
};

//Edit Place
const updatePlace = (req, res) => {
  findById(req.params.id)
    .then((Place) => {
      Place.name = req.body.name;
      Place.placeLocation = req.body.placeLocation;
      Place.description = req.body.description;

      Place.save()
        .then(() => res.status(200).json("Place updated"))
        .catch((err) => res.status(400).json({ Error: err }));
    })

    .catch((err) => res.status(400).json({ Erro: err }));
};

//Delete Place
const deletePlace = (req, res) => {
  findByIdAndDelete(req.params.id)
    .then(() => res.status(200).json("Hotel deleted"))
    .catch((err) => res.status(400).json({ Error: err }));
};

export { getPlaces, getPlace, updatePlace, deletePlace };
