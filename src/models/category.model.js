const { urlencoded } = require("express");
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
      urlencoded,
    },
    default: {},
  },
  parent_category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
});

module.exports = model("Category", categorySchema);
