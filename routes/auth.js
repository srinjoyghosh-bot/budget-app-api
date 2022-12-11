const authController = require("../controllers/auth");
const { body } = require("express-validator");
const express = require("express");
const User = require("../models/user");
const isAuth = require("../middleware/isauth");

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
  isAuth,
  authController.changePassword
);

router.put(
  "/update-budget",
  [body("budget").trim().not().isEmpty().isDecimal()],
  isAuth,
  authController.updateBudget
);

router.get("/profile", isAuth, authController.getProfile);

router.put(
  "/edit-profile",
  body("email")
    .isEmail()
    .withMessage("Please enter a email")
    .custom(async (value, { req }) => {
      const userFromId = await User.findById(req.params.id);
      const userFromEmail = await User.findOne({ email: value });
      // console.log(userFromId)
      // console.log(userFromEmail);
      if (!userFromId) {
        return Promise.reject("Wrong id");
      }
      if (userFromEmail) {
        console.log(userFromId.email.toString());
        console.log(value);
        if (value.toString() !== userFromId.email.toString()) {
          console.log("rejecting");
          return Promise.reject("Email already exists");
        }
      }
    })
    .normalizeEmail(),
  body("name").trim().not().isEmpty(),
  isAuth,
  authController.editProfile
);

module.exports = router;
