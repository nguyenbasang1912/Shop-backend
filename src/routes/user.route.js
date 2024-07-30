const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { verifyUser } = require("../middlewares/auth.middleware");
const {
  uploadFile,
  cloudinaryUpload,
} = require("../middlewares/upload.middleware");
const deleteImage = require("../utils/upload");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", verifyUser, UserController.logoutUser);
router.post("/", verifyUser, UserController.getUser);
router.post("/renew-tokens", UserController.renewTokens);
router.post("/favorite", verifyUser, UserController.updateFavorite);
router.delete("/favorite/:id", verifyUser, UserController.deleteFavorite);

router.post("/address", verifyUser, UserController.createAddress);
router.put("/address/:id", verifyUser, UserController.updateAddress);
router.delete("/address/:id", verifyUser, UserController.deleteAddress);
router.post(
  "/me",
  [verifyUser, uploadFile("avatar"), cloudinaryUpload],
  UserController.editUser,
  (err, req, res, next) => {
    if (req?.avatar) {
      deleteImage([req.avatar.public_id]);
    }
    next(err);
  }
);

module.exports = router;
