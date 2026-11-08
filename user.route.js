const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model/user.model");
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).send({ msg: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).send({ msg: "Password must be at least 6 characters" });
    }
    const exists = await userModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).send({ msg: "This email is already registered. Log in instead." });
    }
    const hash = await bcrypt.hash(password, 5);
    await new userModel({ name, email, password: hash }).save();
    res.status(201).send({ msg: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: (email || "").toLowerCase() });
    if (!user) {
      return res.status(404).send({ msg: "No account with this email. Sign up first." });
    }
    const match = await bcrypt.compare(password || "", user.password);
    if (!match) {
      return res.status(401).send({ msg: "Wrong email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.send({ msg: "User login successfully", token, name: user.name });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = { userRouter };
