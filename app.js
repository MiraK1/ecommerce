const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req, resp) => {
	resp.send("hello from home");
});

app.listen(port, () => {
	console.log("up and running");
});
