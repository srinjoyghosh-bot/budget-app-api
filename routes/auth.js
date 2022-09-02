const authController = require("../controllers/auth");
const { body } = require("express-validator");
const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("username").trim().not().isEmpty(),
    body("budget").trim().not().isEmpty().isDecimal(),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a email")
      .normalizeEmail(),
    body("password").trim(),
  ],
  authController.login
);

router.post(
  "/change-password",
  [
    body("oldPassword").trim().isLength({ min: 5 }),
    body("newPassword").trim().isLength({ min: 5 }),
    body("confirmPassword").trim().isLength({ min: 5 }),
  ],
  authController.changePassword
);

router.post(
  "/update-budget",
  [body("budget").trim().not().isEmpty().isDecimal()],
  authController.updateBudget
);

router.get("/profile", authController.getProfile);

module.exports = router;
