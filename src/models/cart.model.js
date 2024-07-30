const { model, Schema } = require("mongoose");

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  products: {
    type: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        size: { type: String, required: true },
        color: { type: String, required: true },
        is_checked: { type: Boolean, required: true, default: false },
      },
    ],
    default: [],
  },
});

module.exports = model("Cart", cartSchema);
