const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");

router.post("", CommentController.createComment);

router.get("/:productId", CommentController.filterCommentByProduct);

router.put("/:commentId", CommentController.filterCommentByRating);

module.exports = router;
