require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const { ErrorResponse } = require("../utils/responseHandle");
const jwt = require("jsonwebtoken");

const registerUser = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "All fields are required!",
    });
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "User already exists!",
    });
  }

  const newUser = new User({ email, password, name });
  await newUser.save();
  return {
    email: newUser.email,
    name: newUser.name,
  };
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "All fields are required!",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "User not found!",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Invalid credentials!",
    });
  }

  return {
    user: {
      email: user.email,
      name: user.name,
      avatar: user.avatar?.url || "",
    },
    tokens: generateTokens(user._id, user.email),
  };
};

const generateTokens = (userId, email) => {
  const payload = {
    userId,
    email,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 30,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const getUserInfo = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "User not found!",
    });
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
};
