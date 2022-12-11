const Transaction = require("../models/transaction");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMapKey = (date) => {
  const month = months[date.getMonth()];
  return month + "_" + date.getFullYear();
};

const throwError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

exports.getTransactions = async (req, res, next) => {
  try {
    let date;
    if (!req.query.date) {
      date = new Date();
    } else {
      date = new Date(req.query.date);
    }
    const transactions = await Transaction.find({
      userId: req.params.id,
    }).sort({
      createdAt: -1,
    });
    let t_list;
    if (!transactions) {
      t_list = [];
    } else {
      t_list = transactions.filter((transaction) => {
        const t_date = new Date(transaction.createdAt);
        if (
          t_date.getDate() === date.getDate() &&
          t_date.getFullYear() === date.getFullYear() &&
          t_date.getMonth() === date.getMonth()
        ) {
          return true;
        } else {
          return false;
        }
      });
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

exports.getStats = async (req, res, next) => {
  try {
    // const userId = req.params.id;
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({
        message: "no user id",
        userId: userId,
      });
    }
    const transactions = await Transaction.find({ userId: userId });

    const date = new Date();
    let t_list;
    let monthly = 0;
    let food = 0;
    let clothes = 0;
    let travel = 0;
    let miscellaneous = 0;
    if (!transactions) {
      t_list = [];
    } else {
      t_list = transactions.filter((transaction) => {
        const t_date = new Date(transaction.createdAt);
        if (
          date.getMonth() === t_date.getMonth() &&
          date.getFullYear() == t_date.getFullYear()
        ) {
          return true;
        }
        return false;
      });

      t_list.forEach((transaction, index) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.t_type == "spent") {
          monthly += amount;
        } else {
          monthly -= amount;
        }

        switch (transaction.t_category) {
          case "food":
            if (transaction.t_type == "spent") {
              food += amount;
            } else {
              food -= amount;
            }
            break;
          case "clothes":
            if (transaction.t_type == "spent") {
              clothes += amount;
            } else {
              clothes -= amount;
            }
            break;
          case "travel":
            if (transaction.t_type == "spent") {
              travel += amount;
            } else {
              travel -= amount;
            }
            break;
          case "miscellaneous":
            if (transaction.t_type == "spent") {
              miscellaneous += amount;
            } else {
              miscellaneous -= amount;
            }
            break;
          default:
            if (transaction.t_type == "spent") {
              miscellaneous += amount;
            } else {
              miscellaneous -= amount;
            }
            break;
        }
      });
    }

    res.status(200).json({
      net_total_spent: monthly,
      food_cost: food,
      travel_cost: travel,
      clothes_cost: clothes,
      miscellaneous_cost: miscellaneous,
      transactions: t_list,
    });
  } catch (error) {
    throwError(error, next);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let t_list;
    const transactions = await Transaction.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (!transactions) {
      t_list = [];
    } else {
      const date = new Date();
      t_list = transactions.filter((transaction) => {
        const t_date = new Date(transaction.createdAt);
        if (
          date.getMonth() === t_date.getMonth() &&
          date.getFullYear() == t_date.getFullYear()
        ) {
          return false;
        }
        return true;
      });
    }
    if (t_list.length === 0) {
      return res.status(200).json({
        data: null,
      });
    }
    const map = new Map();
    t_list.forEach((transaction, index) => {
      const t_date = new Date(transaction.createdAt);
      const key = getMapKey(t_date);
      if (!map.has(key)) {
        map.set(key, [transaction]);
      } else {
        const list = map.get(key);
        list.push(transaction);
        map.set(key, list);
      }
    });
    res.status(200).json({
      data: Object.fromEntries(map),
    });
  } catch (error) {
    throwError(error, next);
  }
};
