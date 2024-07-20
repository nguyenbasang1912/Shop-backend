const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { verifyUser } = require("../middlewares/auth.middleware");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/", verifyUser, UserController.getUser);
router.post("/renew-tokens", UserController.renewTokens);
router.post("/favorite", verifyUser, UserController.updateFavorite);
router.delete("/favorite/:id", verifyUser, UserController.deleteFavorite);

module.exports = router;
