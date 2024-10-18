import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";

import {getSolicitudes, crearSolicitud} from "../data/solicitud.js"

const ROLE_ASEGURADOR = "asegurador"
const ROLE_ASEGURADO = "asegurado"

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";

solicitudesRouter.get("/list", auth, async (req, res) => {
    try {
        const { _id, role } = req.user;  // _id se toma del usuario autenticado
        const { nombreConductor, fechaDesde, fechaHasta } = req.query;
        let result;
        
        if (role === ROLE_ASEGURADOR) {
            result = await getSolicitudes(nombreConductor, fechaDesde, fechaHasta);
        } else if (role === ROLE_ASEGURADO) {
            result = await getSolicitudes(nombreConductor, fechaDesde, fechaHasta, _id);
        } else {
            return res.status(401).send({ MSG_ERROR_401 });
        }

        res.status(200).send(result);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

solicitudesRouter.post("/send", validarSolicitud ,async (req, res) => {
    
    try {
        const result = await crearSolicitud(req.body)
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

export default solicitudesRouter;