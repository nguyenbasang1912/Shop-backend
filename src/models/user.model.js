const { model, Schema } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "male",
  },
  phone: {
    type: String,
    default: "",
  },
  avatar: {
    type: {
      public_id: String,
      url: String,
    },
    default: {},
  },
});

userSchema.pre("save", async function (next) {
  const passwordHash = await bcrypt.hash(this.password, 10);
  this.password = passwordHash;
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("User", userSchema);
