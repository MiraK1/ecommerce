const express = require("express");

const router = express.Router();

const { isAuth, isAdmin, requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { create } = require("../controllers/category");

router.param("userId", userById);

router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);

module.exports = router;
