const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transaction");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { Stream } = require("stream");

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * allows access to any domain. we could have restricted domains here
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(helmet());
app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    data: err.data,
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then((result) => {
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });
