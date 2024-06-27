const { StatusCodes, ReasonPhrases } = require("http-status-codes");

class SuccessResponse {
  constructor({ status, message, data }) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  json(res) {
    return res.status(this.status || StatusCodes.OK).json({
      message: this.message || ReasonPhrases.OK,
      data: this.data,
    });
  }
}

class ErrorResponse extends Error {
  constructor({ status, message }) {
    super(message);
    this.status = status;
  }
}

module.exports = {
  SuccessResponse,
  ErrorResponse,
};
