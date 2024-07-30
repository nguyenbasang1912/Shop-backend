const express = require("express");
const router = express.Router();

router.use("/auth", require("./user.route"));
router.use("/category", require("./category.route"));
router.use("/product", require("./product.route"));
router.use("/cart", require("./cart.route"));
router.use("/promo", require("./promo.route"));
router.use("/order", require("./order.route"));
router.use("/comments", require("./comment.route"));

module.exports = router;
