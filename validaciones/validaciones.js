import {esquemaSolicitud } from "./esquemas.js";

const validarSolicitud = (req, res, next) => {
    const { error } = esquemaSolicitud.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };

  export default validarSolicitud
