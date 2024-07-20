const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart.controller");
const { verifyUser } = require("../middlewares/auth.middleware");

router.use(verifyUser);
router.post("/", CartController.addToCart);
router.put("/", CartController.updateCartItemQuantity);
router.post("/delete", CartController.removeCartItem);
router.post("/get-cart", CartController.getCart);
router.post("/estimate-amount", CartController.estimateAmount);

module.exports = router;
