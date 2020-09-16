const express = require("express");

const router = express.Router();

const { isAuth, isAdmin, requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
	create,
	read,
	update,
	remove,
	categoryById,
	readAll,
} = require("../controllers/category");

router.param("userId", userById);
router.param("categoryId", categoryById);

router.get("/category/:categoryId", read);
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);
router.put(
	"/category/:categoryId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	update,
);
router.delete(
	"/category/:categoryId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove,
);
router.get("/categories", readAll);

module.exports = router;
