import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";

import {getSolicitudes, crearSolicitud} from "../data/solicitud.js"

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";

solicitudesRouter.get("/list", auth, async (req, res) =>{
    try {
        const { _id, role } = req.user;
        if (role !== ROLE_ASEGURADOR) {
            return res.status(401).send({ MSG_ERROR_401 });
        }
        else{
            result = await getSolicitudes()
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
})

solicitudesRouter.post("/send", validarSolicitud ,async (req, res) => {
    
    try {
        const result = await crearSolicitud(req.body)
    if (!result) {
        return res.status(409).send({ error: MSG_ERROR_POLIZA_EXISTE });
      }
      res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

export default solicitudesRouter;