import jwt from "jsonwebtoken";

const MSG_ERROR_PERMISOS = "No tiene permisos para realizar esta acción.";
const MSG_ERROR_EXPIRED_TOKEN = "El link ha caducado, intentelo nuevamente."

async function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: MSG_ERROR_PERMISOS });

  jwt.verify(token, process.env.CLAVE_SECRETA, (err, user) => {
      if (err) return res.status(403).json({ error: MSG_ERROR_PERMISOS });
      req.user = user;
      next();
  });
}

export default auth;

export const authReset = (req, res, next) => {
  const {token } = req.params

  if (!token) return res.status(401).json({ error: MSG_ERROR_EXPIRED_TOKEN });

    jwt.verify(token, process.env.CLAVE_SECRETA, (err, user) => {
    if (err) {
      return res.status(403).json({ error: MSG_ERROR_EXPIRED_TOKEN });
    }
    req.user = user;
    next();
  });
};
