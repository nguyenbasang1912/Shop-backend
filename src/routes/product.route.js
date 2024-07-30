const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const {
  uploadFiles,
  cloudinaryUploadMultiple,
} = require("../middlewares/upload.middleware");
const deleteImage = require("../utils/upload");

router.post(
  "",
  [uploadFiles("imgs"), cloudinaryUploadMultiple],
  ProductController.createNewProduct,
  (err, req, res, next) => {
    if (req?.images?.length > 0) {
      deleteImage(req.images.map((image) => image.public_id));
    }
    next(err);
  }
);

router.delete("/:id", ProductController.deleteProduct);
router.put(
  "/:id",
  [uploadFiles("imgs"), cloudinaryUploadMultiple],
  ProductController.updateProduct,
  (err, req, res, next) => {
    if (req?.images?.length > 0) {
      deleteImage(req.images.map((image) => image.public_id));
    }
    next(err);
  }
);

router.get("", ProductController.queryProducts)
router.get('/detail/:id', ProductController.getDetailProduct)

module.exports = router;
