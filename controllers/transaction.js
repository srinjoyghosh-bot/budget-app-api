const Transaction = require("../models/transaction");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const throwError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      userId: req.body.userId,
    });
    let t_list;
    if (!transactions) {
      t_list = [];
    } else {
      t_list = transactions;
    }
    res.status(200).json({
      transactions: t_list,
    });
  } catch (error) {
    throwError(error, next);
  }
};

exports.addTransaction = async (req, res, next) => {
  const errors = validationResult(req).errors;
  if (errors.length !== 0) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    error.data = errors;
    // throw error;
    next(error);
  }
  try {
    const title = req.body.title;
    const amount = req.body.amount;
    const t_type = req.body.type;
    const t_category = req.body.category;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User does not exist for this id");
      error.statusCode = 401;
      // throw error;
      next(error);
    }
    const transaction = new Transaction({
      title: title,
      amount: amount,
      t_type: t_type,
      t_category: t_category,
      userId: userId,
    });
    const result = await transaction.save();
    user.transactions.push(transaction);
    await user.save();

    res.status(200).json({
      message: "Transaction created",
      result: result,
    });
  } catch (error) {
    console.log(error);
    throwError(error);
  }
};
