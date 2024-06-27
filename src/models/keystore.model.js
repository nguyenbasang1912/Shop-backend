const { model, Schema } = require("mongoose");

const keystoreSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  refreshToken: { type: String, default: "" },
  refreshTokenUsed: {
    type: [String],
    default: [],
  },
});

module.exports = model("Keystore", keystoreSchema);
