const Keystore = require("../models/keystore.model");

const createKeystore = async ({ userId, refreshToken }) => {
  const filter = { userId },
    update = {
      userId,
      refreshToken,
      refreshTokensUsed: [],
    },
    options = {
      new: true,
      upsert: true,
    };

  const keystore = await Keystore.findOneAndUpdate(filter, update, options);
  return keystore;
};

const findRefreshTokenUsed = async (refreshToken) => {
  const keystore = await Keystore.findOne({ refreshTokenUsed: refreshToken });
  return keystore;
};

const findByRefreshToken = async (refreshToken) => {
  const keystore = await Keystore.findOne({ refreshToken });
  return keystore;
};

const deleteKeystore = async (userId) => {
  const keystore = await Keystore.findOneAndDelete({ userId });
  return keystore;
};

module.exports = {
  createKeystore,
  findRefreshTokenUsed,
  deleteKeystore,
  findByRefreshToken,
};
