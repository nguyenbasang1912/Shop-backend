const { asyncHandler } = require("../utils/errorHandle");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { SuccessResponse } = require("../utils/responseHandle");
const {
  registerUser,
  loginUser,
  getUserInfo,
} = require("../services/user.service");

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  new SuccessResponse({
    status: StatusCodes.CREATED,
    message: "User created successfully!",
    data: await registerUser(email, password, name),
  }).json(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User logged in successfully!",
    data: await loginUser(email, password),
  }).json(res);
});

const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  new SuccessResponse({
    status: StatusCodes.OK,
    message: "User info fetched successfully!",
    data: await getUserInfo(userId),
  }).json(res);
});

module.exports = {
  register,
  login,
  getUser,
};
