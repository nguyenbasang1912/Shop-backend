const { model, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
      unique: true,
    },
    product_description: {
      type: String,
      default: "",
    },
    product_thumbnail: {
      type: String,
      default: "",
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_images: {
      type: [
        {
          public_id: String,
          url: String,
        },
      ],
      default: [],
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    product_sizes: {
      type: [String],
      default: [],
    },
    product_colors: {
      type: [String],
      default: [],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    saleOff: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  if (this.product_images?.[0]) {
    this.product_thumbnail = this.product_images[0].url;
  }
  next();
});

module.exports = model("Product", productSchema);
