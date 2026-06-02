const mongoose = require("mongoose");

const nominationSchema = new mongoose.Schema(
  {
    ceremony: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ceremony",
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      default: null
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      default: null
    },
    description: {
      type: String,
      default: ""
    },
    isWinner: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

nominationSchema.index({ ceremony: 1, category: 1 });

module.exports = mongoose.model("Nomination", nominationSchema);
