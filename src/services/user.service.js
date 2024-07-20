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
const { Types } = require("mongoose");

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

  const tokens = generateTokens(user._id, user.email, user.role);
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

const generateTokens = (userId, email, role) => {
  const payload = {
    userId,
    email,
    role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5h",
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
  const user = await User.findById(userId).select(
    "name email gender phone favorites address avatar"
  );

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

  const tokens = generateTokens(user._id, user.email, user.role);

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

const updateFavorite = async (userId, productId) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: {
        favorites: productId,
      },
    },
    {
      new: true,
    }
  ).select("favorites");
  return user.populate(
    "favorites",
    "product_name product_price product_thumbnail saleOff"
  );
};

const deleteFavorite = async (userId, productId) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $pull: { favorites: productId },
    },
    {
      new: true,
    }
  ).select("favorites");
  return user.populate(
    "favorites",
    "product_name product_price product_thumbnail saleOff"
  );
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  renewTokens,
  updateFavorite,
  deleteFavorite,
};
