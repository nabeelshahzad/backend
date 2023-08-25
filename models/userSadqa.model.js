const mongoose = require("mongoose");

const userSadqaSchema = mongoose.Schema(
  {
    sadqaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Sadqa",
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

module.exports = mongoose.model("UserSadqa", userSadqaSchema);


