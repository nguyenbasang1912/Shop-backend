const { model, Schema } = require("mongoose");

const commentSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true },
    comment_text: { type: String, required: true },
    comment_images: {
      type: [
        {
          public_id: String,
          url: String,
        },
      ],
      default: [],
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Comment", commentSchema);
