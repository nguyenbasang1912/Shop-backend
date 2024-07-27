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
const Cart = require("../models/cart.model");
const Keystore = require("../models/keystore.model");
const bcrypt = require("bcrypt");

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
    expiresIn: "1h",
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
  const user = await User.findById(userId)
    .populate(
      "favorites",
      "product_name product_price product_thumbnail saleOff"
    )
    .select("name email gender phone favorites address avatar default_address");

  if (!user) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "User not found!",
    });
  }
  const cart = await Cart.findOne({ userId: userId })
    .populate(
      "products.productId",
      "product_name product_thumbnail product_price"
    )
    .lean();

  return {
    user,
    cart: cart || {
      products: [],
    },
  };
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

const logoutUser = async (userId) => {
  await Keystore.findOneAndUpdate({ userId });
  return true;
};

const createNewAddress = async (userId, address) => {
  const { isDefault, ...rest } = address;

  if (isDefault) {
    console.log(rest)
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          address: rest,
        },
        default_address: rest,
      },
      {
        new: true,
      }
    ).select("address default_address");
  }

  return await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        address: rest,
      },
    },
    {
      new: true,
    }
  ).select("address default_address");
};

const updateAddress = async (userId, addressId, newAddress) => {
  const { isDefault, ...rest } = newAddress;

  if (isDefault) {
    console.log(rest)
    return await User.findOneAndUpdate(
      { _id: userId, "address._id": addressId },
      {
        $set: { "address.$": rest },
        default_address: rest,
      },
      { new: true }
    ).select("address default_address");
  }

  return await User.findOneAndUpdate(
    { _id: userId, "address._id": addressId },
    {
      $set: { "address.$": rest },
    },
    { new: true }
  ).select("address default_address");
};

const deleteAddress = async (userId, addressId) => {
  const user = await User.findOne({_id: userId}).select("address default_address")

  user.address = user.address.filter(address => address._id !== addressId)
  // const user = await User.findByIdAndUpdate(
  //   userId,
  //   {
  //     $pull: {
  //       address: { _id: addressId },
  //     },
  //   },
  //   {
  //     new: true,
  //   }
  // ).select("address");
  return user;
};

const editUser = async (userId, action) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ErrorResponse({ status: 404, message: "User not found" });
  }

  switch (action.type) {
    case "gender": {
      user.gender = action.payload;
      await user.save();
      return user.select("gender");
    }
    case "phone": {
      user.phone = action.payload;
      await user.save();
      return user.select("phone");
    }
    case "password": {
      const checkPassword = bcrypt.compareSync(
        user.password,
        action.payload.oldPassword
      );
      if (!checkPassword) {
        throw new ErrorResponse({
          status: 401,
          message: "Invalid old password",
        });
      }

      user.password = bcrypt.hashSync(action.payload.newPassword, 10);
      await user.save();
      return true;
    }
    default: {
      user.avatar = action.payload;
      await user.save();
      return user.select("avatar");
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  renewTokens,
  updateFavorite,
  deleteFavorite,
  logoutUser,
  createNewAddress,
  updateAddress,
  deleteAddress,
  editUser,
};
