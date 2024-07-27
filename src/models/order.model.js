const { model, Schema } = require("mongoose");

const orderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    products: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          size: { type: String, required: true },
          color: { type: String, required: true },
          isComment: { type: Boolean, required: true },
        },
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shipping_address: {
      type: String,
    },
    phone: {
      type: String,
    },
    promo_code: {
      type: String,
    },
    payment_method: {
      type: String,
      enum: ["cash", "visa", "online"],
      required: true,
      default: "cash",
    },
    total_amount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Order", orderSchema);
