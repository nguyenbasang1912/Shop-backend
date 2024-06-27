const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { verifyUser } = require("../middlewares/auth.middleware");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/", verifyUser, UserController.getUser);

module.exports = router;
