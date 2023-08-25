const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Activity = require("../models/activity.model");
const Donation = require("../models/donation.model");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", async (req, res) => {
  const donation = await Donation.find();

  res.status(200).send(donation);
});

router.get("/id/:id", async (req, res) => {
  try {
    console.log("id:", req.params.id);

    const donation = await Donation.findById({
      _id: req.params.id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Donation found!",
      data: { donation },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
