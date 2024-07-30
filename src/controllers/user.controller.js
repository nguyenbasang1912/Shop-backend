const { asyncHandler } = require("../utils/errorHandle");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { SuccessResponse } = require("../utils/responseHandle");
const UserService = require("../services/user.service");

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  new SuccessResponse({
    status: StatusCodes.CREATED,
    message: "User created successfully!",
    data: await UserService.registerUser(email, password, name),
  }).json(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User logged in successfully!",
    data: await UserService.loginUser(email, password),
  }).json(res);
});

const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User info fetched successfully!",
    data: await UserService.getUserInfo(userId),
  }).json(res);
});

const renewTokens = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  new SuccessResponse({
    status: StatusCodes.CREATED,
    message: "Tokens renewed successfully!",
    data: await UserService.renewTokens(refreshToken),
  }).json(res);
});

const updateFavorite = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Favorite item updated successfully!",
    data: await UserService.updateFavorite(userId, productId),
  }).json(res);
})

const deleteFavorite = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Favorite item deleted successfully!",
    data: await UserService.deleteFavorite(userId, id),
  }).json(res);
});

const logoutUser = asyncHandler(async (req, res) => {
  
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User logged out successfully!",
    data: await UserService.logoutUser(req.user.userId),
  }).json(res);
})

const createAddress = asyncHandler(async (req, res) => {

  new SuccessResponse({
    status: StatusCodes.CREATED,
    message: "Address created successfully!",
    data: await UserService.createNewAddress(req.user.userId, req.body),
  }).json(res)
});

const updateAddress = asyncHandler(async (req, res) => {

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Address updated successfully!",
    data: await UserService.updateAddress(req.user.userId, req.params.id, req.body),
  }).json(res)
})

const deleteAddress = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "Address deleted successfully!",
    data: await UserService.deleteAddress(userId, id),
  }).json(res)
})

const editUser = asyncHandler(async (req, res) => {
  const {type, payload} = req.body
  const avatar = req.avatar

  let action = {
    type,
    payload,
  }

  if (avatar) {
    action.payload = avatar
  }

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User updated successfully!",
    data: await UserService.editUser(req.user.userId, action),
  }).json(res)
})

module.exports = {
  register,
  login,
  getUser,
  renewTokens,
  updateFavorite,
  deleteFavorite,
  logoutUser,
  createAddress,
  updateAddress,
  deleteAddress,
  editUser
};
