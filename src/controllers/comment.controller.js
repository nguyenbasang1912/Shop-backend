const { asyncHandler } = require("../utils/errorHandle");
const CommentService = require("../services/comment.service");
const { SuccessResponse } = require("../utils/responseHandle");

const createComment = asyncHandler(async (req, res, next) => {
  const images = req.images;
  const user = req.user;

  const body = {
    user: user,
    productId: req.body.productId,
    orderId: req.body.orderId,
    images,
    content: req.body.content,
    rating: req.body.rating,
  };

  new SuccessResponse({
    status: 201,
    message: "Comment created successfully!",
    data: await CommentService.createNewComment(body),
  }).json(res);
});

const filterCommentByRating = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: "Comments filtered successfully!",
    data: await CommentService.filterCommentByRating({ ...req.body }),
  }).json(res);
});

const filterCommentByProduct = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: "Comments filtered successfully!",
    data: await CommentService.filterCommentByProduct(req.params.productId),
  }).json(res);
});

module.exports = {
  createComment,
  filterCommentByRating,
  filterCommentByProduct, // Add this line to your controller file
};
