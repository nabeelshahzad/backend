const mongoose = require("mongoose");

const userDonationSchema = mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Donation",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserDonation", userDonationSchema);
