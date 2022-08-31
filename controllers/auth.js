const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const throwError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req).errors;
  if (errors.length !== 0) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    error.data = errors;
    throw error;
  }
  try {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const budget = req.body.budget;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      username: username,
      budget: budget || "0",
    });
    const result = await user.save();
    res.status(201).json({
      message: "User created",
      user: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req).errors;
  if (errors.length !== 0) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    error.data = errors;
    throw error;
  }
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User does not exist for this email");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password! Try again");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        username: user.username,
        budget: user.budget,
        userId: user._id.toString(),
      },
      "mysecretsecret",
      {
        // expiresIn: "1h",
      }
    );
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (error) {
    throwError(error, next);
  }
};
