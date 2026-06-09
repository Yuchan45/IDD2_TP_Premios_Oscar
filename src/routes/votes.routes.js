const { Router } = require("express");
const voteController = require("../controllers/vote.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validateRequest = require("../middlewares/validateRequest");
const {
  castVoteValidation,
  changeVoteValidation,
  myVoteStatusValidation,
  myVotesQueryValidation,
  nominationVoteStatusValidation,
  voteQueryValidation
} = require("../validations/vote.validation");

const router = Router();

router.use(authenticate);

// Registra un voto del usuario autenticado para una nominacion.
router.post(
  "/",
  authorize("ACADEMY_MEMBER"),
  castVoteValidation,
  validateRequest,
  voteController.cast
);
// Cambia el voto del usuario autenticado dentro de una misma categoria.
router.put(
  "/",
  authorize("ACADEMY_MEMBER"),
  changeVoteValidation,
  validateRequest,
  voteController.change
);
// Devuelve los votos emitidos por el usuario autenticado con filtros opcionales.
router.get("/my-votes", myVotesQueryValidation, validateRequest, voteController.myVote);
// Resume el estado de votacion del usuario actual dentro de una ceremonia.
router.get("/me/status", myVoteStatusValidation, validateRequest, voteController.myStatus);
// Devuelve el total de votos de una nominacion y si el usuario ya voto esa categoria.
router.get(
  "/nominations/:nominacionId",
  nominationVoteStatusValidation,
  validateRequest,
  voteController.nominationStatus
);
// Devuelve el conteo general de votos de una ceremonia, con filtro opcional por categoria.
router.get("/", voteQueryValidation, validateRequest, voteController.counts);

module.exports = router;
