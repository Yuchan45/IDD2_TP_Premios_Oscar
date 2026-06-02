const mongoose = require("mongoose");

const ceremonySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "CLOSED"],
      default: "PLANNED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ceremony", ceremonySchema);
