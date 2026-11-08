const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

require("dotenv").config();

const connection = mongoose.connect(process.env.mongourl);

module.exports = { connection };