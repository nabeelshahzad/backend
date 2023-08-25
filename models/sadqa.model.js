const mongoose = require("mongoose");

const sadqaSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["MONEY", "MEAT", "CLOTHES"], //More ENUMS if you want to add later
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sadqa", sadqaSchema);
