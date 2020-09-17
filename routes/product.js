const express = require("express");

const router = express.Router();

const { isAuth, isAdmin, requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
	productById,
	create,
	read,
	remove,
	update,
	list,
	listRelated,
	listCategories,
	listBySearch,
	photo,
} = require("../controllers/product");

router.param("userId", userById);
router.param("productId", productById);

router.get("/product/:productId", read);
router.get("/product/photo/:productId", photo);
router.get("/products", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);

router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.post("/products/by/search", listBySearch);

router.delete(
	"/product/:productId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove,
);

router.put(
	"/product/:productId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	update,
);

module.exports = router;
