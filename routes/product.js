const express = require("express");

const router = express.Router();

const { isAuth, isAdmin, requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { productById, create, read, remove } = require("../controllers/product");

router.param("userId", userById);
router.param("productId", productById);

router.get("/product/:productId", read);
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.post(
	"/product/:productId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove,
);

module.exports = router;
