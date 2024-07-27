const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { ErrorResponse } = require("../utils/responseHandle");

const notFoundHandler = (req, res, next) => {
  const notFoundError = new ErrorResponse({
    status: StatusCodes.NOT_FOUND,
    message: `${StatusCodes.NOT_FOUND} - ${ReasonPhrases.NOT_FOUND}`,
  });

  next(notFoundError);
};

const errorHandler = (err, req, res, next) => {
  console.log(err)
  return res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
    stacktrace: err.stack,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
