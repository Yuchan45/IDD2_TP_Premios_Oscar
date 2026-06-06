function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: "No autenticado." } });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ error: { message: "No tiene permisos para esta accion." } });
    }

    next();
  };
}

module.exports = authorize;
