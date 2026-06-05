const mongoose = require("mongoose");

const ROLE_NAMES = [
  "Actor Principal",
  "Actor Secundario",
  "Director",
  "Productor"
];

const castSchema = new mongoose.Schema(
  {
    profesionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    rol: {
      type: String,
      required: true,
      trim: true,
      enum: ROLE_NAMES
    }
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    anioEstreno: {
      type: Number,
      required: true,
      min: 1888
    },
    genero: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      default: ""
    },
    reparto: {
      type: [castSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "peliculas"
  }
);

module.exports = mongoose.model("Movie", movieSchema);
