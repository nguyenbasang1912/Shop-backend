const { asyncHandler } = require("../utils/errorHandle");
const { SuccessResponse } = require("../utils/responseHandle");
const CartService = require("../services/cart.service");

const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, color, size } = req.body;
  const user = req.user;

  new SuccessResponse({
    status: 200,
    message: "Product added to cart successfully!",
    data: await CartService.addToCart({
      productId,
      quantity,
      userId: user.userId,
      color,
      size,
    }),
  }).json(res);
});

const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { productId, quantity, is_checked, cartItemId } = req.body;
  const user = req.user;
  new SuccessResponse({
    status: 200,
    message: "Cart item quantity updated successfully!",
    data: await CartService.updateQuantity({
      userId: user.userId,
      quantity,
      productId,
      is_checked,
      cartItemId,
    }),
  }).json(res);
});

const removeCartItem = asyncHandler(async (req, res, next) => {
  const { cartItemId } = req.body;
  const user = req.user;

  new SuccessResponse({
    status: 200,
    message: "Cart item removed successfully!",
    data: await CartService.deleteProductInCart({
      userId: user.userId,
      cartItemId,
    }),
  }).json(res);
});

const getCart = asyncHandler(async (req, res, next) => {
  const user = req.user;

  new SuccessResponse({
    status: 200,
    message: "Cart fetched successfully!",
    data: await CartService.getCartByUserId(user.userId),
  }).json(res);
});

const estimateAmount = asyncHandler(async (req, res, next) => {
  const { promo } = req.body;
  const user = req.user;

  new SuccessResponse({
    status: 200,
    message: "Cart estimate fetched successfully!",
    data: await CartService.estimateAmount(user.userId, promo),
  }).json(res);
});

module.exports = {
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  getCart,
  estimateAmount,
};
