const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 255,
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
		},
		price: {
			type: Number,
			trim: true,
			required: true,
		},
		prevPrice: {
			type: Number,
			trim: true,
			required: false,
		},
		category: {
			type: ObjectId,
			ref: "Category",
			required: true,
		},
		quantity: {
			type: Number,
		},
		photo: {
			type: Buffer,
			contentType: String,
		},
		shipping: {
			required: false,
			type: Boolean,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
