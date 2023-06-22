import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RefreshTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: [true, "Please add user id"],
  },
  refreshToken: {
    type: String,
    required: [true, "Please add refresh token"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60,
  },
});

export default model("RefreshToken", RefreshTokenSchema);
