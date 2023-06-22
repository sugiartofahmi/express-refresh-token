import jwt from "jsonwebtoken";
import Token from "../models/refreshToken.js";
import Users from "../models/user.js";
import { comparePassword, encryptPassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "failed",
        message: "name cannot be empty",
      });
    }
    if (!email) {
      return res.status(400).json({
        status: "failed",
        message: "email cannot be empty",
      });
    }
    if (!password) {
      return res.status(400).json({
        status: "failed",
        message: "password cannot be empty",
      });
    }
    if (!confirmPassword) {
      return res.status(400).json({
        status: "failed",
        message: "confirm password cannot be empty",
      });
    }
    const isEmailExist = await Users.findOne({ email }).exec();
    if (isEmailExist) {
      return res.status(400).json({
        status: "failed",
        message: "email already exist, please login",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "failed",
        message: "password not match",
      });
    }
    const user = await Users.create({
      name,
      email,
      password: await encryptPassword(password),
    });
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "failed",
        message: "email cannot be empty",
      });
    }
    if (!password) {
      return res.status(400).json({
        status: "failed",
        message: "password cannot be empty",
      });
    }
    const user = await Users.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "account not found",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Wrong  password",
      });
    }
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(200).json({
      status: "success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userToken = req.header("Authorization").split(" ")[1];
    const token = await Token.findOneAndDelete({ refreshToken: userToken });
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Logged Out Sucessfully",
    });
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const userToken = req.header("Authorization").split(" ")[1];

    const token = await Token.findOne({ refreshToken: userToken });
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid refresh token",
      });
    }
    jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) {
          return res
            .status(401)
            .json({ status: "failed", token, message: "Token is not valid" });
        } else {
          const user = decoded;
          const newAccessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1m",
            }
          );
          res.status(200).json({
            status: "success",
            accessToken: newAccessToken,
          });
        }
      }
    );
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};
