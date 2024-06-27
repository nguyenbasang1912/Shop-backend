require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/error.middleware");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
