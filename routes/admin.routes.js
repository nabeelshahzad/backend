const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
// const bodyParser = require("body-parser");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const Donation = require("../models/donation.model");

router.get("/users", async (req, res) => {
  const user = await User.find();

  res.status(200).send(user);
});

router.get("/donations", async (req, res) => {
  const donation = await Donation.find();

  res.status(200).send(donation);
});

router.get("/", async (req, res) => {
  const activity = await Activity.find();

  res.status(200).send(activity);
});

router.delete("/activities", async (req, res) => {
  const activity = await Activity.deleteMany();

  res.status(200).send(activity);
});

router.delete("/users", async (req, res) => {
  const user = await User.deleteMany();

  res.status(200).send(user);
});

router.delete("/donations", async (req, res) => {
  const donation = await Donation.deleteMany();

  res.status(200).send(donation);
});

router.delete("/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
});

router.get("/blocked-users", async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true });

    return res.json(blockedUsers);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving blocked users.",
      error: error.message,
    });
  }
});

router.put("/block/:id", async (req, res) => {
  const userId = req.params.id;
  const { block } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { type: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBlocked = block;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error blocking user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while blocking the user" });
  }
});

router.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUserPassword = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUserPassword) {
      return res.status(404).json({ error: "User not found" });
    }

    await updatedUserPassword.save();
    return res.status(200).json(updatedUserPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user password" });
  }
});

router.post("/donation", async (req, res) => {
  try {
    const { videoUrl, imageUrl, name, description, amount } = req.body;

    const newDonation = new Donation({
      videoUrl,
      imageUrl,
      name,
      description,
      amount,
    });

    const createdDonation = await newDonation.save();

    return res.status(200).json({
      success: true,
      message: "Donation created successfully",
      data: { createdDonation },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the donation" });
  }
});

module.exports = router;
