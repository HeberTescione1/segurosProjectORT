import express from "express";
import { addPoliza } from "../data/poliza.js";
import auth from "../middleware/auth.js";

const polizasRouter = express.Router();
const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_POLIZA_EXISTE = "La poliza ya se encuentra registrada.";

polizasRouter.post("/register", auth, async (req, res) => {
  try {
    if (!validarBodyRegistro(req.body)) {
      return res.status(400).send({ error: MSG_ERROR_VALIDACION });
    }
    const result = await addPoliza(req.body);
    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_POLIZA_EXISTE });
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

function validarBodyRegistro(body) {
  return body.aseguradorId && body.dniAsegurado && body.dominio;
}

export default polizasRouter;
