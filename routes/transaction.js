const transactionController = require("../controllers/transaction");
const { body } = require("express-validator");
const express = require("express");
const isAuth = require("../middleware/isauth");

const router = express.Router();

router.get("/get/:id", transactionController.getTransactions);

router.post(
  "/add",
  [
    body("title").trim().not().isEmpty(),
    body("amount")
      .trim()
      .isDecimal()
      .withMessage("Please enter a proper amount"),
  ],
  // isAuth,
  transactionController.addTransaction
);

module.exports = router;
