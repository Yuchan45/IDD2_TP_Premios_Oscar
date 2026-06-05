const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "categorias"
  }
);

module.exports = mongoose.model("Category", categorySchema);
