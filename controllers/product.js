const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();

	form.keepExtensions = true;
	form.multiples = true;

	// console.log(req.body);
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({ error: "Image could not be uploaded" });
		}
		let product = new Product(fields);

		// check for fields
		const { name, description, category, quantity, shipping } = fields;

		if (!name || !description || !category || !quantity || !shipping) {
			return res.status(400).json({ error: "All fields are required" });
		}

		if (files.photo) {
			if (files.photo.size > 2 * 1024 * 1024) {
				return res.status(400).json({ error: "Image should be less than 1MB" });
			}
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}
		product.save((err, result) => {
			if (err) {
				res.status(400).json({ error: errorHandler(err) });
			}
			res.json(result);
		});
	});
};

exports.productById = (req, res, next, id) => {
	Product.findById(id).exec((err, product) => {
		if (err) {
			return res.status(400).json({ error: "Product doesn't exist" });
		}
		req.product = product;
		next();
	});
};

exports.read = (req, res) => {
	req.product.photo = undefined;
	return res.json(req.product);
};

exports.remove = (req, res) => {
	let product = req.product;
	if (!product) {
		return res.status(400).json({ error: "product doesn't exist" });
	}
	product.remove((err, deletedProduct) => {
		if (err) {
			res.status(400).json({ error: errorHandler(err) });
		}
		deletedProduct.photo = undefined;
		return res.json({
			deletedProduct,
			message: "Product deleted succesfuly",
		});
	});
};

exports.update = (req, res) => {
	let form = new formidable.IncomingForm();

	form.keepExtensions = true;
	form.multiples = true;

	// console.log(req.body);
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({ error: "Image could not be uploaded" });
		}
		let product = req.product;
		product = _.extend(product, fields);

		// check for fields

		if (files.photo) {
			if (files.photo.size > 1 * 1024 * 1024) {
				return res.status(400).json({ error: "Image should be less than 1MB" });
			}
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}
		product.save((err, result) => {
			if (err) {
				res.status(400).json({ error: errorHandler(err) });
			}
			res.json(result);
		});
	});
};

/**
 * sell / arrival
 *
 * by sell = /products?sortBy=sold&order=desc&limit=4
 *
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 *
 * if no params are sent,then all products are returned
 *
 */

exports.list = (req, res) => {
	let order = req.query.order ? req.query.order : "asc";
	let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
	let limit = req.query.limit ? parseInt(req.query.limit) : 50;

	Product.find()
		.select("-photo")
		.populate("category")
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: "Products not found",
				});
			}
			res.json(products);
		});
};

exports.listRelated = (req, res) => {
	/**
	 * it will find the products based on the req product
	 */
	let limit = req.query.limit ? parseInt(req.query.limit) : 5;

	Product.find({
		_id: {
			$ne: req.product,
		},
		category: req.product.category,
	})
		.limit(limit)
		.populate("category", "_id name")
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: "Products not found",
				});
			}
			res.json(
				products.map(
					({ name, category, quantity, shipping, prevPrice, sold }) => ({
						name,
						category,
						quantity,
						shipping,
						prevPrice,
						sold,
					}),
				),
			);
		});
};
exports.listCategories = (req, res) => {
	Product.distinct("category", {}, (err, categories) => {
		if (err) {
			return res.status(400).json({
				error: "Products not found",
			});
		}
		res.json(categories);
	});
};

exports.listBySearch = (req, res) => {
	let order = req.body.order ? req.body.order : "desc";
	let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let findArgs = {};

	// console.log(order, sortBy, limit, skip, req.body.filters);
	// console.log("findArgs", findArgs);

	for (let key in req.body.filters) {
		if (req.body.filters[key].length > 0) {
			if (key === "price") {
				// gte -  greater than price [0-10]
				// lte - less than
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1],
				};
			} else {
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	Product.find(findArgs)
		.select("-photo")
		.populate("category")
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: "Products not found",
				});
			}
			res.json({
				size: data.length,
				data,
			});
		});
};

exports.photo = (req, res, next) => {
	if (req.product.photo.data) {
		res.set("Content-Type", req.product.photo.contentType);
		return res.send(req.product.photo.data);
	}
	next();
};
