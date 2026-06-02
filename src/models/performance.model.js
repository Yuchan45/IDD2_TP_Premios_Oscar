const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    ceremony: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ceremony",
      required: true
    },
    artistName: {
      type: String,
      required: true,
      trim: true
    },
    performanceType: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

performanceSchema.index({ ceremony: 1 });

module.exports = mongoose.model("Performance", performanceSchema);
