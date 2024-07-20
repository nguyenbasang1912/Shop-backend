const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/auth.middleware");
const OrderController = require("../controllers/order.controller");

router.put("/:orderId", OrderController.updateState);
router.get("", OrderController.getAllOrders);

router.use(verifyUser);
router.post("", OrderController.createOrder);
router.get("/:orderId", OrderController.getOrderById);
router.get("", OrderController.getListOrderByUserId);

module.exports = router;
