const Comment = require("../models/comment.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { cleanObject } = require("../utils/index");
const { default: mongoose } = require("mongoose");

const createNewComment = async ({
  user,
  productId,
  orderId,
  images,
  content,
  rating,
}) => {
  const order = await Order.findOne({
    _id: orderId,
    "products.productId": productId,
  });

  if (!order) {
    throw new Error({
      message: "User don't purchase products, cannot comment",
      statusCode: 401,
    });
  }

  const { userId } = user;

  const comment = cleanObject({
    userId,
    productId,
    comment_text: content,
    comment_images: images,
    rating,
  });

  const newComment = await Comment.findOneAndUpdate(
    {
      userId,
    },
    comment,
    {
      new: true,
      upsert: true,
    }
  );

  order.products = order.products.map((product) => {
    if (product.productId.toString() === productId) {
      return {
        ...product,
        isComment: false,
      };
    }
    return product;
  });

  await order.save();

  const aggregate = await Comment.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $project: {
        _id: 0,
        avgRating: 1,
      },
    },
  ]);

  if (aggregate.length > 0) {
    const { avgRating } = aggregate[0];

    const product = await Product.findOneAndUpdate(
      { _id: productId },
      {
        rate: avgRating,
      }
    );
  }

  return newComment;
};

const filterCommentByRating = async ({ productId, rating }) => {
  const comments = await Comment.find({
    productId,
    rating,
  }).populate("userId", "username");

  return comments;
};

const filterCommentByProduct = async (productId) => {
  const comments = await Comment.find({ productId }).populate(
    "userId",
    "username"
  );
  return comments;
};

module.exports = {
  createNewComment,
  filterCommentByRating,
  filterCommentByProduct,
};
