import jwt from "jsonwebtoken";
import token from "../models/refreshToken.js";

export const generateToken = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1m",
    }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const userRefreshToken = await token.findOne({ userId: user._id });
  if (userRefreshToken) {
    await token.findOneAndUpdate(
      { userId: user._id },
      { refreshToken },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    await token.create({ userId: user._id, refreshToken });
  }

  return { accessToken, refreshToken };
};
