// import { verify } from "jsonwebtoken";
import pkg from "jsonwebtoken";
const { verify } = pkg;
// import HttpError from "../models/errorModel";

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];
    try {
      req.user = verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }
};

export default authMiddleware;
