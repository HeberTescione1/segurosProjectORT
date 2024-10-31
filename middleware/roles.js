//FALTA IMPLEMENTAR.

const verificarRolAsegurado = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADO) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};

const verificarRolAsegurador = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADOR) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};
