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

const updateQuantity = async ({
  userId,
  productId,
  quantity,
  is_checked = false,
}) => {
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
    return await deleteProductInCart({ userId, productId });
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

const deleteProductInCart = async ({ userId, productId }) => {
  const cart = await Cart.findOneAndUpdate(
    {
      userId: userId,
      "products.productId": productId,
    },
    {
      $pull: {
        products: {
          productId,
        },
      },
    },
    { new: true }
  ).populate(
    "products.productId",
    "product_name product_thumbnail saleOff product_price"
  );

  console.log(userId, cart, productId)
  return cart
};

const getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId })
    .populate(
      "products.productId",
      "product_name product_thumbnail product_price"
    )
    .lean();

  if (!cart) {
    return await Cart.create({ userId });
  }

  return cart;
};

const estimateAmount = async (userId, promoCode) => {
  const cart = await Cart.findOne({ userId })
    .populate("products.productId", "product_price")
    .lean();

  if (!cart) {
    throw new ErrorResponse({
      message: "Cart not found",
      status: StatusCodes.NOT_FOUND,
    });
  }

  const totalAmount = cart.products.reduce((total, product) => {
    if (product.is_checked) {
      return total + product.productId.product_price * product.quantity;
    }
    return total;
  }, 0);

  let amountAfterUsePromo = totalAmount;

  if (!promoCode) {
    return {
      totalAmount,
      shipping: 0,
      amountAfterUsePromo,
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
      if (existPromo.type === "fixed") {
        if (product.productId.product_price >= existPromo.value) {
          return total + product.productId.product_price * product.quantity;
        }
        return total + (existPromo.value * product.quantity - existPromo.value);
      }
      return (
        total +
        product.productId.product_price *
          product.quantity *
          (1 - existPromo.value / 100)
      );
    }, 0);

  return {
    totalAmount,
    shipping: 0,
    amountAfterUsePromo,
  };
};

const removeProductBeforeOrderIfOutOfStock = async (userId) => {
  const cart = await Cart.findOne({ userId });

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

  console.log("final: ", products);

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
