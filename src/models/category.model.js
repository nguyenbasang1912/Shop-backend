const { model, Schema } = require("mongoose");

const categorySchema = new Schema({
  category_name: {
    type: String,
    required: true,
    unique: true,
  },
  category_thumbnail: {
    type: {
      public_id: String,
      url: String,
    },
    default: {},
  },
  parent_category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  is_deleted: { type: Boolean, default: false },
});

module.exports = model("Category", categorySchema);
