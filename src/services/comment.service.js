const Comment = require("../models/comment.model");
const Order = require("../models/order.model");

const createNewComment = async ({
  user,
  productId,
  images,
  content,
  rating,
}) => {
  const order = Order.findOne({
    user_id: user.userId,
    "products.product_id": productId,
  }).lean();

  if (!order) {
    throw new Error({
      message: "User don't purchase products, cannot comment",
      statusCode: 403,
    })
  }

  const { userId } = user;
  const newComment = await Comment.create({
    userId,
    productId,
    comment_text: content,
    comment_images: images,
    rating,
  });

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
