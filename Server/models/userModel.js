import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "default-avatar.png" },
    posts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
