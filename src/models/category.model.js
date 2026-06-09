const mongoose = require("mongoose");

const CATEGORY_TIPOS = ["pelicula", "profesional"];

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    tipo: {
      type: String,
      enum: CATEGORY_TIPOS,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "categorias",
  },
);

module.exports = mongoose.model("Category", categorySchema);
