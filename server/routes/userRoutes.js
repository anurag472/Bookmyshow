const express = require("express");
const router = express.Router();
const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", async (req, res) => {
  try {

    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      res.send({
        success: false,
        message: "User already exists",
      })
      return
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    res.send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user) {
            res.send({
                success: false,
                message: "Invalid email"
            })
            return
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if(!validPassword) {
            res.send({
                success: false,
                message: "Invalid password"
            })
            return
        }

        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: "1h"})

        res.send({
            success: true,
            message: "User logged in successfully",
            token: token
        })
    } catch (error) {
        console.log(error)
        res.send({
            success: false,
            message: error.message
        })
    }
});

router.get("/get-current-user", authMiddleware, async (req, res) => {
  const user = await User.findById(req.body.userId).select("-password");
  res.send({
    success: true,
    message: "You are authenticated",
    data: user,
  });
});

module.exports = router;
