const transactionController = require("../controllers/transaction");
const { body } = require("express-validator");
const express = require("express");
const isAuth = require("../middleware/isauth");

const router = express.Router();

router.get("/get",isAuth, transactionController.getTransactions);

router.post(
  "/add",
  [
    body("title").trim().not().isEmpty(),
    body("amount")
      .trim()
      .isDecimal()
      .withMessage("Please enter a proper amount"),
  ],
  isAuth,
  transactionController.addTransaction
);

router.get("/stats", isAuth, transactionController.getStats);

router.get("/history",isAuth, transactionController.getHistory);

module.exports = router;
