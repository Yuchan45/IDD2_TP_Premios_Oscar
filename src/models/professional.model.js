const mongoose = require("mongoose");

const ROLE_NAMES = [
  "Actor Principal",
  "Actor Secundario",
  "Director",
  "Productor"
];

const roleSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      enum: ROLE_NAMES
    }
  },
  { _id: false }
);

const professionalSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      required: true,
      trim: true
    },
    nacionalidad: {
      type: String,
      required: true,
      trim: true
    },
    roles: {
      type: [roleSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "profesionales"
  }
);

module.exports = mongoose.model("Professional", professionalSchema);
