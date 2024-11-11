//FALTA IMPLEMENTAR.
const ROLE_ASEGURADO = "asegurado"; 
const ROLE_ASEGURADOR = "asegurador"; 
const ROLE_ADMINISTRADOR = "admin";

export const verificarRolAsegurado = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADO) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};


export const verificarRolesPrimarios = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADO && role !== ROLE_ASEGURADOR) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};

export const verificarRolAsegurador = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADOR) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};

export const verificarRolAdministrador = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ADMINISTRADOR) {
    return res.status(403).send({ error: "Usuario sin permisos." });
  }

  next();
};
