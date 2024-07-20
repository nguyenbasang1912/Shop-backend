const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { ErrorResponse } = require("../utils/responseHandle");
const deleteImage = require("../utils/upload");
const { StatusCodes } = require("http-status-codes");
const { filterProducts } = require("../utils");

const createNewProduct = async (body) => {
  const category = await Category.findOne({
    _id: body.category_id,
    is_deleted: false,
  });

  if (!category) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category not found!",
    });
  }

  const product = await Product.create(body);
  return product;
};

const updateProduct = async (id, body) => {
  if (body.category_id) {
    const category = await Category.findOne({
      _id: body.category_id,
      is_deleted: false,
    });

    if (!category) {
      throw new ErrorResponse({
        status: StatusCodes.BAD_REQUEST,
        message: "Category not found!",
      });
    }
  }

  const prod = await Product.findById(id);
  if (!prod) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Product not found!",
    });
  }

  if (prod.is_deleted) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Product has been deleted!",
    });
  }

  if (body.product_images) {
    const ids =
      prod.product_images.length > 0
        ? prod.product_images.map((item) => {
            return item.public_id;
          })
        : null;
    deleteImage(ids);
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { ...body, product_thumbnail: body.product_images[0].url },
    { new: true }
  );
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Product not found!",
    });
  }

  await product.updateOne({ is_deleted: false });
  return true;
};

const searchProduct = async (keyword) => {
  const products = await Product.find({
    product_name: { $regex: keyword, $options: "i" },
    is_deleted: false,
  }).lean();
  return products;
};

const queryProducts = async (body) => {
  const filter = filterProducts(null, {
    type: body.type,
    payload: body.payload,
  });

  const limit = 6;
  const currentPage = body.page - 1;
  const skip = currentPage * limit;

  const totalProducts = await Product.countDocuments(filter);
  const maxPages = Math.ceil(totalProducts / limit);

  const products = await Product.find(filter)
    .select("product_name product_thumbnail product_price saleOff")
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    products,
    page: {
      maxPages,
      currentPage: +body.page,
    },
  };
};

const getDetailProduct = async (id) => {
  const product = await Product.findOne({ _id: id })
    .select(
      "product_name product_description product_price product_images stock product_sizes product_colors saleOff category_id"
    )
    .lean();
  return {
    ...product,
    product_images: product.product_images.map((item) => {
      return item.url;
    }),
  };
};

module.exports = {
  createNewProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  queryProducts,
  getDetailProduct,
};
