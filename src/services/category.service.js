const Category = require("../models/category.model");
const Product = require("../models/product.model");
const { cleanObject } = require("../utils");
const deleteImage = require("../utils/upload");
const { ErrorResponse } = require("../utils/responseHandle");
const { StatusCodes } = require("http-status-codes");
const { Types } = require("mongoose");

const createNewCategory = async (name, image, parentId = null) => {
  console.log(image);
  const category = await Category.create(
    cleanObject({
      category_name: name,
      category_thumbnail: image,
      parent_category: parentId,
    })
  );

  if (!category) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category not created!",
    });
  }

  return category;
};

const updateCategory = async (id, name, image, parentId = null) => {
  if (!id) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category id not provided!",
    });
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category not found!",
    });
  }

  if (image && category?.category_thumbnail?.public_id) {
    deleteImage(category.category_thumbnail.public_id);
  }

  const update = cleanObject({
    category_name: name,
    category_thumbnail: image,
    parent_category: parentId,
  });

  return await Category.findByIdAndUpdate(id, update, { new: true });
};

const deleteCategory = async (id) => {
  if (!id) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category id not provided!",
    });
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category not found!",
    });
  }

  const products = await Product.find({ category_id: id }).lean();
  if (products.length > 0) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      message: "Category not deleted!",
    });
  }

  return await category
    .updateOne(
      {
        is_deleted: true,
      },
      {
        new: true,
      }
    )
    .lean();
};

const findAllParentCategories = async () => {
  return await Category.find({ parent_category: null, is_deleted: false })
    .select("category_name category_thumbnail category_thumbnail")
    .lean();
};

const findAllCategories = async () => {
  return await Category.find({ is_deleted: false })
    .select("category_name category_thumbnail category_thumbnail")
    .lean();
};

const findAllChildCategoriesByParentId = async (parentId) => {
  return await Category.find({ parent_category: parentId, is_deleted: false })
    .select("category_name category_thumbnail category_thumbnail")
    .lean();
};

const findAllChildCategories = async () => {
  const categories = await Category.find({
    parent_category: { $ne: null },
    is_deleted: false,
  })
    .select("category_name category_thumbnail category_thumbnail")
    .lean();
  return categories.map((category) => {
    return {
      ...category,
      category_thumbnail: category.category_thumbnail.url,
    };
  });
};

module.exports = {
  createNewCategory,
  updateCategory,
  deleteCategory,
  findAllParentCategories,
  findAllChildCategoriesByParentId,
  findAllCategories,
  findAllChildCategories,
};
