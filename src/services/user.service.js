require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const { ErrorResponse } = require("../utils/responseHandle");
const jwt = require("jsonwebtoken");
const {
  createKeystore,
  findRefreshTokenUsed,
  deleteKeystore,
  findByRefreshToken,
} = require("./keystore.service");
const { decodedToken } = require("../utils/token");

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

  const tokens = generateTokens(user._id, user.email);
  const keystore = createKeystore({
    userId: user._id,
    refreshToken: tokens.refreshToken,
  });

  if (!keystore) {
    throw new ErrorResponse({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
    });
  }

  return {
    user: {
      email: user.email,
      name: user.name,
      avatar: user.avatar?.url || "",
    },
    tokens,
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

const renewTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Missing refresh token!",
    });
  }

  const usedRefreshToken = await findRefreshTokenUsed(refreshToken);
  if (usedRefreshToken) {
    const decode = decodedToken(
      usedRefreshToken.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    await deleteKeystore(decode.userId);
    throw new ErrorResponse({
      status: StatusCodes.FORBIDDEN,
      message: "Something went wrong!, please try again!",
    });
  }

  const keystore = await findByRefreshToken(refreshToken);
  if (!keystore) {
    throw new ErrorResponse({
      status: StatusCodes.FORBIDDEN,
      message: "Refresh token not found!",
    });
  }

  const { userId } = decodedToken(
    keystore.refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "User not found!",
    });
  }

  const tokens = generateTokens(user._id, user.email);

  await keystore.updateOne({
    $set: {
      refreshToken: tokens.refreshToken,
    },
    $addToSet: {
      refreshTokenUsed: refreshToken,
    },
  });

  return tokens;
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  renewTokens,
};
