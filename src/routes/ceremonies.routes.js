const { Router } = require("express");
const ceremonyController = require("../controllers/ceremony.controller");
const validateRequest = require("../middlewares/validateRequest");
const { cache, invalidateCache } = require("../middlewares/cache");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  ceremonyIdValidation,
  ceremonyCategoryValidation,
  createCeremonyValidation,
  updateCeremonyValidation,
  listNominacionesValidation,
  nominacionIdValidation,
  actuacionIdValidation,
  addNominacionValidation,
  updateNominacionValidation,
  addActuacionValidation,
  updateActuacionValidation
} = require("../validations/ceremony.validation");

const router = Router();

// Lista todas las ceremonias disponibles.
router.get("/", cache("ceremonies", 120), ceremonyController.list);
// Devuelve el detalle completo de una ceremonia por ID.
router.get("/:id", ceremonyIdValidation, validateRequest, cache("ceremonies", 120), ceremonyController.get);
// Devuelve el resumen de resultados de una ceremonia agrupado por categoria.
router.get("/:id/results", ceremonyIdValidation, validateRequest, ceremonyController.results);
// Devuelve el ranking de nominaciones por votos para una categoria dentro de una ceremonia.
router.get(
  "/:id/categories/:categoryId/leaderboard",
  ceremonyCategoryValidation,
  validateRequest,
  ceremonyController.leaderboard
);
// Lista las nominaciones de una ceremonia con filtros opcionales por categoria y ganador.
router.get("/:id/nominaciones", listNominacionesValidation, validateRequest, ceremonyController.listNominaciones);
// Lista las actuaciones musicales de una ceremonia.
router.get("/:id/actuaciones", ceremonyIdValidation, validateRequest, ceremonyController.listActuaciones);

// Crea una nueva ceremonia.
router.post("/", authenticate, authorize("ADMIN"), createCeremonyValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.create);
// Cierra una ceremonia, calcula ganadores y registra premios.
router.post("/:id/close", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.close);
// Agrega una nominacion a una ceremonia abierta.
router.post("/:id/nominaciones", authenticate, authorize("ADMIN"), addNominacionValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.addNominacion);
// Agrega una actuacion musical a una ceremonia abierta.
router.post("/:id/actuaciones", authenticate, authorize("ADMIN"), addActuacionValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.addActuacion);
// Actualiza los datos generales de una ceremonia.
router.put("/:id", authenticate, authorize("ADMIN"), updateCeremonyValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.update);
// Actualiza una nominacion existente dentro de una ceremonia abierta.
router.put("/:id/nominaciones/:nomId", authenticate, authorize("ADMIN"), updateNominacionValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.updateNominacion);
// Actualiza una actuacion musical existente dentro de una ceremonia abierta.
router.put("/:id/actuaciones/:actuacionId", authenticate, authorize("ADMIN"), updateActuacionValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.updateActuacion);
// Elimina una ceremonia por ID.
router.delete("/:id", authenticate, authorize("ADMIN"), ceremonyIdValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.remove);
// Elimina una nominacion de una ceremonia abierta.
router.delete("/:id/nominaciones/:nomId", authenticate, authorize("ADMIN"), nominacionIdValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.removeNominacion);
// Elimina una actuacion musical de una ceremonia abierta.
router.delete("/:id/actuaciones/:actuacionId", authenticate, authorize("ADMIN"), actuacionIdValidation, validateRequest, invalidateCache("ceremonies"), ceremonyController.removeActuacion);

module.exports = router;
