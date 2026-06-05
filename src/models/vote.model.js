const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },
    ceremonyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ceremony",
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    nominacionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "votos"
  }
);

voteSchema.index({ userId: 1, ceremonyId: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
