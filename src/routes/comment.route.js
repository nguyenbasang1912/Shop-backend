const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");
const {
  uploadFiles,
  cloudinaryUploadMultiple,
} = require("../middlewares/upload.middleware");
const { verifyUser } = require("../middlewares/auth.middleware");
const deleteImage = require("../utils/upload");

router.post(
  "",
  [verifyUser, uploadFiles("imgs"), cloudinaryUploadMultiple],
  CommentController.createComment,
  (err, req, res, next) => {
    if (req?.images?.length > 0) {
      deleteImage(req.images.map((image) => image.public_id));
    }
    next(err);
  }
);

router.get("/:productId", CommentController.filterCommentByProduct);

router.put("/:commentId", CommentController.filterCommentByRating);

module.exports = router;
