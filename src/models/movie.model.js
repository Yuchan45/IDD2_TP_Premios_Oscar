const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    releaseYear: {
      type: Number,
      required: true
    },
    genre: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    professionalRoles: [
      {
        professional: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Professional",
          required: true
        },
        role: {
          type: String,
          enum: ["Actor Principal", "Secundario", "Reparto", "Extra", null],
          default: null
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
