const nodemailer = require("nodemailer");

exports.email = (output) => {
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: "karim2jihad@gmail.com",
			pass: process.env.EMAIL_CODE,
		},
	});

	// send mail with defined transport object
	let info = transporter.sendMail({
		from: "	server <karim2jihad@gmail.com>",
		to: "karim2jihad@gmail.com",
		subject: "New Order",
		text: output,
		html: output,
	});

	return info;
};
