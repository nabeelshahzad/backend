const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
  {
    videoUrl: [
      {
        type: String,
        required: false,
      },
    ],
    imageUrl: [
      {
        type: String,
        required: false,
      },
    ],
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);
