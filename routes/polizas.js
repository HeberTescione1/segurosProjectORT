import express from "express";
import { addPoliza, getPolizas } from "../data/poliza.js";
import auth from "../middleware/auth.js";

const polizasRouter = express.Router();

const ROLE_ASEGURADOR = "asegurador";

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_POLIZA_EXISTE = "La poliza ya se encuentra registrada.";
const MSG_ERROR_PERMISOS = "No tiene permisos para realizar esta acción.";

polizasRouter.post("/register", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ MSG_ERROR_PERMISOS });
    }

    if (!validarBodyRegistro(req.body)) {
      return res.status(400).send({ error: MSG_ERROR_VALIDACION });
    }
    req.body.aseguradorId = _id;
    const result = await addPoliza(req.body);
    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_POLIZA_EXISTE });
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Listar todas las polizas del asegurador al ingresar a la app
polizasRouter.get("/list", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
   
    const result = await getPolizas(_id, role);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

function validarBodyRegistro(body) {
  return body.dniAsegurado && body.dominio;
}

export default polizasRouter;