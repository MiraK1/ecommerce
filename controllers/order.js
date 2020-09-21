const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
// sendgrid for email npm i @sendgrid/mail
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');
const { email } = require("./email");

exports.orderById = (req, res, next, id) => {
	Order.findById(id)
		.populate("products.product", "name price")
		.exec((err, order) => {
			if (err || !order) {
				return res.status(400).json({
					error: errorHandler(err),
				});
			}
			req.order = order;
			next();
		});
};

exports.create = (req, res) => {
	console.log("CREATE ORDER: ", req.body);
	req.body.order.user = req.profile;
	const order = new Order(req.body.order);
	order.save((error, data) => {
		if (error) {
			return res.status(400).json({
				error: errorHandler(error),
			});
		}
		// send email alert to admin
		// order.address
		// order.products.length
		// order.amount
		const output = `
            <p>Customer name:</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>
            <a href='https://www.jiihane.com'>Link to Dashboard</a>
        `;
		email(output);
		res.json(data);
	});
};

exports.listOrders = (req, res) => {
	Order.find()
		.populate("user", "_id name address")
		.sort("-created")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(error),
				});
			}
			res.json(orders);
		});
};

exports.getStatusValues = (req, res) => {
	res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
	Order.update(
		{ _id: req.body.orderId },
		{ $set: { status: req.body.status } },
		(err, order) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err),
				});
			}
			res.json(order);
		},
	);
};
