import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    skills: [{ type: String }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profile: { type: profileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
