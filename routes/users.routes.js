const express = require("express");
const router = express.Router();
const libphonenumberJs = require("libphonenumber-js");
const multer = require("multer");
const upload = multer({ dest: "img/" });
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { sendEmail } = require("../utils/nodemailer.util");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/auth.middleware");
const otpGenerator = require("otp-generator");
const HttpException = require("http-exception");

router.get("/users", async (req, res) => {
  const user = await User.find();

  res.status(200).send(user);
});

router.get("/my-profile", authMiddleware, async (req, res) => {
  const user = req.user;

  const userData = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    id: user.id,
    imageUrl: user.imageUrl,
  };

  res.status(200).json(userData);
});

router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = req.file.filename;
      await User.findByIdAndUpdate(userId, {
        $set: { imageUrl },
      });

      res.status(200).json({ message: "Image uploaded successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while uploading the image" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // const parsedPhoneNumber = libphonenumberJs.parsePhoneNumberFromString(
    //   phone,
    //   "PK"
    // );

    // if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
    //   return res.status(400).json({ message: "Invalid phone number" });
    // }

    const user = await User.findOne({
      phone: phone,
    });

    if (user.isVerified === false) {
      return res
        .status(403)
        .json({ message: "Your account is not verified.." });
    }

    if (user.isBlocked === true) {
      return res.status(403).json({ message: "Your account is blocked.." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    console.log(isPasswordMatching, password, user.password);
    if (!isPasswordMatching) {
      console.log(isPasswordMatching);
      return res.status(409).json({ message: "Incorrect name or password" });
    }

    const secretKey = process.env.SECRET_KEY;
    const tokenData = jwt.sign(
      { id: user._id, name: user.name, email: user.email, phone: user.phone },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", data: { tokenData } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  if (!req.body.phone || !req.body.password) {
    res.status(400).send("required fields are missing");
  }
  // const parsedPhoneNumber = libphonenumberJs.parsePhoneNumberFromString(
  //   req.body.phone,
  //   "PK"
  // );
  // if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
  //   return res.status(400).json({ message: "Invalid phone number" });
  // }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    country: req.body.country,
    password: hashedPassword,
    otp: otp,
  });

  const emailText = `Hello ${user.name}\n\nThank your for registering on our application. Please use this OTP to verify: ${otp}`;

  await sendEmail({
    to: req.body.email,
    text: emailText,
    subject: "Email Verification",
  }).catch(async (err) => {
    await User.deleteOne({ _id: user._id });
    throw new HttpException(409, "Error verifying user");
  });

  const newUser = user.toJSON();

  // removing otp and password field before sending to user in register response
  delete newUser.otp;
  delete newUser.password;
  return res.json(newUser);
});

router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.status(200).json({ message: "Verification successful." });
    } else {
      return res.status(400).json({ message: "Incorrect OTP." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying user." });
  }
});

router.get("/sercret-data", authMiddleware, (req, res) => {
  res.status(200).json("Hi! if youre seeing !!!");
});

const generateOtp = (module.exports = router);
