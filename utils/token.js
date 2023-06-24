import jwt from "jsonwebtoken";
import Token from "../models/refreshToken.js";

const generateToken = {
  accessToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1m",
      }
    );
  },
  refreshToken: async (user) => {
    const token = await jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "5m",
      }
    );
    const userRefreshToken = await Token.findOne({ userId: user._id });
    if (userRefreshToken) {
      await Token.findOneAndUpdate(
        { userId: user._id },
        { refreshToken: token },
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      await Token.create({ userId: user._id, refreshToken: token });
    }
    return token;
  },
};

export default generateToken;
