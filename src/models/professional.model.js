const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    stageName: {
      type: String,
      default: "",
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ["Actor", "Director", "Productor", "Guionista", "Maquillador"]
    },
    bio: {
      type: String,
      default: ""
    },
    movieRoles: [
      {
        movie: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Movie",
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

module.exports = mongoose.model("Professional", professionalSchema);
