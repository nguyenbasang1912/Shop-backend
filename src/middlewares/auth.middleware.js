require("dotenv").config();
const jwt = require("jsonwebtoken");
const { ErrorResponse } = require("../utils/responseHandle");

const verifyUser = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new ErrorResponse({
      status: 403,
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      err.status = 401;
      next(err);
    }
    const user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    req.user = user;
    next();
  });
};

module.exports = {
  verifyUser,
};
