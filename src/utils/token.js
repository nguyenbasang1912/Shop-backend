const jwt = require("jsonwebtoken");

const decodedToken = (token, key) => {
  return jwt.verify(token, key);
};

module.exports = {
  decodedToken,
};
