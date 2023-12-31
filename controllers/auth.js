import jwt from "jsonwebtoken";
import Token from "../models/refreshToken.js";
import Users from "../models/user.js";
import { comparePassword, encryptPassword } from "../utils/password.js";
import generateToken from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
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

    const isEmailExist = await Users.findOne({ email }).exec();
    if (isEmailExist) {
      return res.status(400).json({
        status: "failed",
        message: "email already exist, please login",
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
    const refreshToken = await generateToken.refreshToken(user);
    const accessToken = await generateToken.accessToken(user);

    res.status(200).json({
      status: "success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
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
    const { refresh_token } = req.body;
    const token = await Token.findOneAndDelete({ refreshToken: refresh_token });
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
    res.status(200).json({
      status: "success",
      access_token: await generateToken.accessToken(req.user),
    });
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};
