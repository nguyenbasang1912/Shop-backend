const { model, Schema } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
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
    address: {
      type: [
        {
          name: String,
          phone: String,
          address: String,
        },
      ],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    favorites: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    default_address: {
      type: {
        name: String,
        phone: String,
        address: String,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const passwordHash = await bcrypt.hash(this.password, 10);
  this.password = passwordHash;
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("User", userSchema);
