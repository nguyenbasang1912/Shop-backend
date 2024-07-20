const {asyncHandler} = require('../utils/errorHandle')
const CommentService = require('../services/comment.service')
const { SuccessResponse } = require('../utils/responseHandle')

const createComment = asyncHandler(async(req, res, next) => {
  new SuccessResponse({
    status: 201,
    message: 'Comment created successfully!',
    data: await CommentService.createNewComment(req.body)
  })
})

const filterCommentByRating = asyncHandler(async(req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: 'Comments filtered successfully!',
    data: await CommentService.filterCommentByRating({...req.body})
  })
})

const filterCommentByProduct = asyncHandler(async(req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: 'Comments filtered successfully!',
    data: await CommentService.filterCommentByProduct(req.params.productId)
  })
})

module.exports = {
  createComment,
  filterCommentByRating,
  filterCommentByProduct,  // Add this line to your controller file
}