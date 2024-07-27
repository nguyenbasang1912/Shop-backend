const { StatusCodes } = require("http-status-codes");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Promo = require("../models/promo.model");
const { ErrorResponse } = require("../utils/responseHandle");

const addToCart = async ({ userId, productId, quantity = 1, color, size }) => {
  const cart = await Cart.findOne({ userId: userId });

  const existProduct = await Product.findOne({
    _id: productId,
    is_deleted: false,
  }).lean();

  if (!existProduct) {
    throw new ErrorResponse({
      message: "Product not available",
      status: StatusCodes.NOT_FOUND,
    });
  }

  if (!cart) {
    const cart = await Cart.create({
      userId,
      products: [
        {
          productId,
          quantity,
          color,
          size,
          is_checked: false,
        },
      ],
    });

    return cart;
  }

  const product = cart.products.find((product) => {
    return (
      product.productId.toString() === productId &&
      product?.color === color &&
      product?.size === size
    );
  });

  const totalQuantity = cart.products.reduce((accu, curr) => {
    if (curr.productId.toString() === productId) {
      return accu + curr.quantity;
    }
    return accu;
  }, 0);

  if (totalQuantity >= existProduct.stock) {
    throw new ErrorResponse({
      message: "Out of stock",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  if (!product) {
    cart.products.push({
      productId,
      quantity,
      color,
      size,
      is_checked: false,
    });
  } else {
    product.quantity += quantity;
  }

  return (await cart.save()).populate(
    "products.productId",
    "product_name product_thumbnail saleOff product_price"
  );
};

const updateQuantity = async (body) => {
  const { userId, productId, cartItemId, quantity, is_checked = false } = body;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ErrorResponse({
      message: "Cart not found",
      status: StatusCodes.NOT_FOUND,
    });
  }

  const existProduct = await Product.findOne({ _id: productId }).lean();

  if (!existProduct) {
    throw new ErrorResponse({
      message: "Product not found",
      status: StatusCodes.NOT_FOUND,
    });
  }

  const product = cart.products.find(
    (product) => product.productId.toString() === productId
  );

  if (!product) {
    throw new ErrorResponse({
      message: "Product not found in cart",
      status: StatusCodes.NOT_FOUND,
    });
  }

  if (quantity <= 0) {
    return await deleteProductInCart({ userId, cartItemId });
  }

  if (quantity > existProduct.stock) {
    throw new ErrorResponse({
      message: "Quantity exceeds stock",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  product.quantity = quantity;
  product.is_checked = is_checked;
  return (await cart.save()).populate(
    "products.productId",
    "product_name product_thumbnail saleOff product_price"
  );
};

const deleteProductInCart = async ({ userId, cartItemId }) => {
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
    },
    {
      $pull: {
        products: {
          _id: cartItemId,
        },
      },
    },
    { new: true }
  ).populate(
    "products.productId",
    "product_name product_thumbnail saleOff product_price"
  );

  return cart;
};

const getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId }).lean();

  if (!cart) {
    return await Cart.create({ userId });
  }

  return await removeProductBeforeOrderIfOutOfStock(cart.userId);
};

const estimateAmount = async (userId, promoCode) => {
  const cart = await Cart.findOne({ userId })
    .populate("products.productId", "product_price saleOff")
    .lean();

  if (!cart) {
    throw new ErrorResponse({
      message: "Cart not found",
      status: StatusCodes.NOT_FOUND,
    });
  }

  const totalAmount = cart.products.reduce((total, product) => {
    if (product.is_checked) {
      const price =
        product.productId.product_price * (1 - product.productId.saleOff / 100);
      return total + price * product.quantity;
    }
    return total;
  }, 0);

  let amountAfterUsePromo = totalAmount;

  if (!promoCode) {
    return {
      totalAmount: totalAmount.toFixed(2),
      amountAfterUsePromo: amountAfterUsePromo.toFixed(2),
    };
  }

  const existPromo = await Promo.findOne({ promo_code: promoCode });

  if (!existPromo) {
    throw new ErrorResponse({
      message: "Invalid promo code",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  if (Date.now() > existPromo.end_date) {
    throw new ErrorResponse({
      message: "Promo code expired",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  amountAfterUsePromo = cart.products
    .filter((product) => product.is_checked)
    .reduce((total, product) => {
      const price =
        product.productId.product_price * (1 - product.productId.saleOff / 100);

      if (existPromo.type === "fixed") {
        if (price >= existPromo.value) {
          return total + price * product.quantity;
        }
        return (
          total +
          (price * product.quantity - existPromo.value * product.quantity)
        );
      }
      return total + price * product.quantity * (1 - existPromo.value / 100);
    }, 0);

  return {
    totalAmount: totalAmount.toFixed(2),
    amountAfterUsePromo: amountAfterUsePromo.toFixed(2),
  };
};

const removeProductBeforeOrderIfOutOfStock = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate(
    "products.productId",
    "product_name product_thumbnail product_price"
  );

  if (!cart) {
    throw new ErrorResponse({
      message: "Cart not found",
      status: StatusCodes.NOT_FOUND,
    });
  }

  const batch = new Map();

  cart.products.forEach((item) => {
    if (batch.has(item.productId)) {
      batch.get(item.productId).push(item);
    } else {
      batch.set(item.productId, [item]);
    }
  });

  const products = [];

  for (const [key, prods] of batch) {
    const product = await Product.findOne({ _id: key, is_deleted: false });
    let stock = product.stock;

    const sortedProduct = prods.sort((a, b) => b.quantity - a.quantity);

    for (const prod of sortedProduct) {
      if (stock >= prod.quantity) {
        stock -= prod.quantity;
        products.push(prod);
      } else {
        break; // exit the loop if stock is not sufficient
      }
    }
  }

  cart.products = products;
  return await cart.save();
};

module.exports = {
  addToCart,
  updateQuantity,
  deleteProductInCart,
  getCartByUserId,
  estimateAmount,
  removeProductBeforeOrderIfOutOfStock,
};
