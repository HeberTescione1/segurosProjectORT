const ROLE_ASEGURADO = "asegurado";
const ROLE_ASEGURADOR = "asegurador";
const ROLE_ADMINISTRADOR = "admin";

const MSG_ERROR_PERMISOS = "Usuario sin permisos.";

export const verificarRolAsegurado = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADO) {
    return res.status(403).send({ error: MSG_ERROR_PERMISOS });
  }

  next();
};

export const verificarRolesPrimarios = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADO && role !== ROLE_ASEGURADOR) {
    return res.status(403).send({ error: MSG_ERROR_PERMISOS });
  }

  next();
};

export const verificarRolAsegurador = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ASEGURADOR) {
    return res.status(403).send({ error: MSG_ERROR_PERMISOS });
  }

  next();
};

export const verificarRolAdministrador = (req, res, next) => {
  const { role } = req.user;

  if (role !== ROLE_ADMINISTRADOR) {
    return res.status(403).send({ error: MSG_ERROR_PERMISOS });
  }

  next();
};
