const ProductService = require("../services/product.service");
const { cleanObject } = require("../utils");
const { asyncHandler } = require("../utils/errorHandle");

const createNewProduct = asyncHandler(async (req, res, next) => {
  const {
    product_name,
    product_description,
    category_id,
    stock,
    product_sizes,
    product_colors,
    product_price,
    saleOff,
  } = req.body;
  const images = req.images;

  res.status(201).json({
    status: 201,
    message: "Product created successfully!",
    data: await ProductService.createNewProduct(
      cleanObject({
        product_name,
        product_description,
        category_id,
        stock,
        product_sizes,
        product_colors,
        product_images: images,
        saleOff,
        product_price,
      })
    ),
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    product_name,
    product_description,
    category_id,
    stock,
    product_sizes,
    product_colors,
  } = req.body;
  const images = req.images;

  res.status(200).json({
    status: 200,
    message: "Product updated successfully!",
    data: await ProductService.updateProduct(
      id,
      cleanObject({
        product_name,
        product_description,
        category_id,
        stock,
        product_sizes,
        product_colors,
        product_images: images,
      })
    ),
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  res.status(200).json({
    status: 200,
    message: "Product deleted successfully!",
    data: await ProductService.deleteProduct(id),
  });
});

const queryProducts = asyncHandler(async (req, res, next) => {
  const { payload, type, page } = req.query;

  res.status(200).json({
    status: 200,
    message: "Products fetched successfully!",
    data: await ProductService.queryProducts({ payload, page, type }),
  });
});

const getDetailProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(200).json({
    status: 200,
    message: "Product fetched successfully!",
    data: await ProductService.getDetailProduct(id),
  })
})

module.exports = {
  createNewProduct,
  updateProduct,
  deleteProduct,
  queryProducts,
  getDetailProduct
};
