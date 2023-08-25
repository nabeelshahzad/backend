const mongoose = require("mongoose");

const activitySchema = mongoose.Schema(
  {
    members: [
      {
        _id: false,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          require: true,
          ref: "User",
        },

        //CATEGORY QURAN_KHWANI
        parah: {
          type: Number,
          required: false,
          min: 1,
          max: 30,
        },
        status: {
          type: String,
          enum: ["FINISHED", "PAUSED", "READING"],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["RUNNING", "PAUSED", "STOPPED"],
    },
    //CATEGORY WAZAIF

    imageUrl: [
      {
        type: String,
        required: false,
      },
    ],
    counter: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
