require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/error.middleware");
const app = express();
const port = process.env.PORT || 3000;
const db_url = process.env.DB_URL;
const { connect } = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/test", (req, res) => {
  res.send("Hello World!");
});
app.use("", require("./routes"));

app.use(notFoundHandler);
app.use(errorHandler);

connect(db_url)
  .then(() => {
    console.log(`Connected to ${db_url}`);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((e) => console.log(`Server connect failed`));
