const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { cleanObject } = require("../utils");
const { ErrorResponse } = require("../utils/responseHandle");
const CartService = require("./cart.service");

const createNewOrder = async ({ user, promo, address, payment }) => {
  const cart = await CartService.removeProductBeforeOrderIfOutOfStock(
    user.userId
  );

  const caculate = await CartService.estimateAmount(user.userId, promo);

  const selectedProducts = cart.products.filter(
    (product) => product.is_checked
  );

  if (!caculate || selectedProducts.length <= 0) {
    throw new ErrorResponse({
      message: "Invalid cart or no products selected",
      status: 400,
    });
  }

  const orderInfo = {
    user_id: user._id,
    products: selectedProducts,
    promo_code: promo,
    shipping_address: address,
    status: "pending",
    payment_method: payment,
  };

  const order = await Order.create(orderInfo)
    .then((doc) => {
      return doc.populate("products.productId", "product_price");
    })
    .then((doc) => {
      return doc;
    })
    .catch(console.log);

  order.products.forEach(async (item) => {
    await Product.findOneAndUpdate(item.productId, {
      $inc: {
        stock: -item.quantity,
      },
    });
  });

  await cart.updateOne({
    $pull: {
      products: {
        is_checked: true,
      },
    },
  });

  return {
    order_info: order,
    total: caculate,
  };
};

const updateState = async (orderId, state) => {
  if (!orderId) {
    throw new ErrorResponse({
      message: "Order ID is required",
      status: 400,
    });
  }

  const order = await Order.findOne({
    _id: orderId,
  });

  if (!order) {
    throw new ErrorResponse({
      message: "Order not found",
      status: 404,
    });
  }

  order.status = state;

  return await order.save();
};

const getOrderById = async (orderId) => {
  return await Order.findById(orderId).populate("user_id", "username");
};

const getOrdersByUserId = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await Order.find({ user_id: userId }).populate("user_id", "username");
};

const getAllOrders = async () => {
  return await Order.find().populate("user_id", "username");
};

module.exports = {
  createNewOrder,
  updateState,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
};
