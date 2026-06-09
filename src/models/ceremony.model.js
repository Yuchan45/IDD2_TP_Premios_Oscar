const mongoose = require("mongoose");

const ARTIST_TYPES = ["Cantante", "Solista", "Banda", "Orquesta", "Actor/Cantante", "Coro"];
const PERFORMANCE_TYPES = ["Musical", "Cancion nominada", "Homenaje", "Apertura", "Intermedio", "Cierre"];
const WINNER_TYPES = ["pelicula", "profesional"];
const CATEGORY_TYPES = ["pelicula", "profesional"];

const categorySnapshotSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: CATEGORY_TYPES,
      required: false,
    },
  },
  { _id: false },
);

const movieSnapshotSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const professionalSnapshotSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    nombreCompleto: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const artistSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      required: true,
      trim: true,
      enum: ARTIST_TYPES,
    },
  },
  { _id: false },
);

const performanceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    tipoActuacion: {
      type: String,
      required: true,
      trim: true,
      enum: PERFORMANCE_TYPES,
    },
    artistas: {
      type: [artistSchema],
      default: [],
    },
  },
  { _id: false },
);

const nominationSchema = new mongoose.Schema(
  {
    categoria: {
      type: categorySnapshotSchema,
      required: true,
    },
    pelicula: {
      type: movieSnapshotSchema,
      default: null,
    },
    profesional: {
      type: professionalSnapshotSchema,
      default: null,
    },
    esGanador: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: true },
);

nominationSchema.pre("validate", function validateNomination(next) {
  const hasMovie = !!this.pelicula;
  const hasProfessional = !!this.profesional;

  if (hasMovie === hasProfessional) {
    this.invalidate(
      "nominacion",
      "La nominacion debe referenciar exactamente una pelicula o un profesional.",
    );
  }

  return next();
});

const winnerSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: WINNER_TYPES,
    },
    pelicula: {
      type: movieSnapshotSchema,
      default: null,
    },
    profesional: {
      type: professionalSnapshotSchema,
      default: null,
    },
  },
  { _id: false },
);

const awardSchema = new mongoose.Schema(
  {
    categoria: {
      type: categorySnapshotSchema,
      required: true,
    },
    nominadoGanadorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ganador: {
      type: winnerSchema,
      required: true,
    },
  },
  { _id: false },
);

awardSchema.pre("validate", function validateAward(next) {
  const winner = this.ganador || {};
  const hasMovie = !!winner.pelicula;
  const hasProfessional = !!winner.profesional;
  const isMovieWinner = winner.tipo === "pelicula";
  const isProfessionalWinner = winner.tipo === "profesional";

  if (hasMovie === hasProfessional) {
    this.invalidate(
      "ganador",
      "El ganador debe contener exactamente una pelicula o un profesional.",
    );
  }

  if (
    (isMovieWinner && !hasMovie) ||
    (isProfessionalWinner && !hasProfessional)
  ) {
    this.invalidate(
      "ganador.tipo",
      "El tipo de ganador no coincide con el snapshot embebido.",
    );
  }

  return next();
});

const CEREMONY_STATES = ["abierta", "cerrada"];

const ceremonySchema = new mongoose.Schema(
  {
    anio: {
      type: Number,
      required: true,
      min: 1929,
    },
    fecha: {
      type: Date,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: CEREMONY_STATES,
      default: "abierta",
    },
    actuaciones: {
      type: [performanceSchema],
      default: [],
    },
    nominaciones: {
      type: [nominationSchema],
      default: [],
    },
    premios: {
      type: [awardSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "ceremonias",
  },
);

module.exports = mongoose.model("Ceremony", ceremonySchema);
