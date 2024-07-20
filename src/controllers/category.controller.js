const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../utils/errorHandle");
const { SuccessResponse } = require("../utils/responseHandle");
const CategoryService = require("../services/category.service");

const createNewCategory = asyncHandler(async (req, res, next) => {
  const { name, parentId } = req.body;
  const image = req.image;
  new SuccessResponse({
    status: StatusCodes.CREATED,
    message: "Category created successfully!",
    data: await CategoryService.createNewCategory(name, image, parentId),
  }).json(res);
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  const image = req.image;
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Category updated successfully!",
    data: await CategoryService.updateCategory(id, name, image, parentId),
  }).json(res);
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Category deleted successfully!",
    data: await CategoryService.deleteCategory(id),
  }).json(res);
});

const getAllCategories = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Categories fetched successfully!",
    data: await CategoryService.findAllCategories(),
  }).json(res);
});

const getAllParentCategories = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Parent categories fetched successfully!",
    data: await CategoryService.findAllParentCategories(),
  }).json(res);
});

const getChildCategories = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Child categories fetched successfully!",
    data: await CategoryService.findAllChildCategories(),
  }).json(res)
})

const getChildCategoriesByParent = asyncHandler(async (req, res, next) => {
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Child categories fetched successfully!",
    data: await CategoryService.findAllChildCategoriesByParentId(req.params.parentId),
  })
})

module.exports = {
  createNewCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getAllParentCategories,
  getChildCategories,
  getChildCategoriesByParent,
};
