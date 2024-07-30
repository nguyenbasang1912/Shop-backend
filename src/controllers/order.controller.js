const { asyncHandler } = require("../utils/errorHandle");
const OrderService = require("../services/order.service");
const { SuccessResponse } = require("../utils/responseHandle");

const createOrder = asyncHandler(async (req, res, next) => {
  const { promo, address, payment, phone } = req.body;
  new SuccessResponse({
    status: 200,
    message: "Order created successfully!",
    data: await OrderService.createNewOrder({
      user: req.user,
      promo,
      address,
      payment,
      phone
    }),
  }).json(res);
});

const updateState = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params; // assuming cartId is unique for each order
  const { state } = req.body;

  new SuccessResponse({
    status: 200,
    message: "Order state updated successfully!",
    data: await OrderService.updateState(orderId, state),
  }).json(res);
});

const getListOrderByUserId = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: "Orders fetched successfully!",
    data: await OrderService.getOrdersByUserId(req.user.userId),
  }).json(res);
});

const getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  new SuccessResponse({
    status: 200,
    message: "Order fetched successfully!",
    data: await OrderService.getOrderById(orderId),
  }).json(res);
});

const getAllOrders = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: 200,
    message: "All orders fetched successfully!",
    data: await OrderService.getAllOrders(),
  }).json(res);
});

module.exports = {
  createOrder,
  updateState,
  getListOrderByUserId,
  getOrderById,
  getAllOrders,
};
