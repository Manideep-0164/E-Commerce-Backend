const userRouter = require("express").Router();
require("dotenv").config();
const { UserModel } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await UserModel.findOne({ email });

    if (userExists)
      return res
        .status(409)
        .json({ message: "User already exists. Please login." });

    const hashedPassword = bcrypt.hashSync(password, 5);

    const registerUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await registerUser.save();

    res.status(201).json({ message: "Successfully Registered." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "User does not exists. Please register." });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid Credentials." });

    const tokenPayload = {
      userId: user._id,
      userRole: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRY,
    });

    res.status(200).json({ message: "Login success.", token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  userRouter,
};
