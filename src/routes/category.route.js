const express = require("express");
const {
  uploadFile,
  cloudinaryUpload,
} = require("../middlewares/upload.middleware");
const deleteImage = require("../utils/upload");
const CategoryController = require("../controllers/category.controller");
const router = express.Router();

router.get("", CategoryController.getAllCategories);
router.get("/parent-categories", CategoryController.getAllParentCategories);
router.get("/child-categories", CategoryController.getChildCategories);
router.get(
  "/child-categories/:parentId",
  CategoryController.getChildCategoriesByParent
);


router.post(
  "",
  [uploadFile("img"), cloudinaryUpload],
  CategoryController.createNewCategory,
  (err, req, res, next) => {
    if (req?.image?.public_id) {
      deleteImage([req.image.public_id]);
    }
    next(err);
  }
);
router.put(
  "/:id",
  [uploadFile("img"), cloudinaryUpload],
  CategoryController.updateCategory,

  (err, req, res, next) => {
    if (req?.image?.public_id) {
      deleteImage([req.image.public_id]);
    }
    next(err);
  }
);
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
