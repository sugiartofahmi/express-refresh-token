import { config } from "dotenv";
import jwt from "jsonwebtoken";
import Token from "../models/refreshToken.js";

config();

const jwtSecret = process.env.REFRESH_TOKEN_SECRET;

const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(401).json({
        status: "failed",
        message: "Token not provided",
      });
    }
    jwt.verify(refresh_token, jwtSecret, async (error, decoded) => {
      if (error) {
        return res
          .status(401)
          .json({ status: "failed", message: "Token is not valid" });
      } else {
        const token = await Token.findOne({ refreshToken: refresh_token });
        if (!token) {
          return res.status(401).json({
            status: "failed",
            message: "Invalid refresh token",
          });
        }
        req.user = decoded;
        next();
      }
    });
  } catch (error) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ status: "failed", message: "Server Error" });
  }
};

export default verifyRefreshToken;
