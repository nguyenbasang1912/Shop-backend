const { model, Schema } = require("mongoose");

const promoSchema = new Schema(
  {
    promo_code: { type: String, required: true, unique: true },
    promo_description: { type: String, required: true },
    type: { type: String, required: true, enum: ["fixed", "percentage"], default: "fixed" },
    value: { type: Number, required: true },
    max_uses: { type: Number, default: 0 },
    uses_left: { type: Number, default: 0 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Promo", promoSchema);
