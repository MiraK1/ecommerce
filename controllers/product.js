const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();

	form.keepExtensions = true;
	form.multiples = true;

	console.log(req.body);
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({ error: "Image could not be uploaded" });
		}
		let product = new Product(fields);

		// check for fields

		const { name, description, category, quantity, shiping } = fields;

		if (!name || !description || !category || !quantity || !shiping) {
			return res.status(400).json({ error: "All fields are required" });
		}

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
		res.status(400).json({ error: "product doesn't exist" });
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
