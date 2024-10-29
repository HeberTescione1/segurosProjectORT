import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";

import {getSolicitudes, crearSolicitud } from "../data/solicitud.js"

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const ROLE_ASEGURADOR = "asegurado"

solicitudesRouter.get("/list", auth, async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { nombrePropietarioAsegurado, estadoSolicitud, fechaDesde, fechaHasta } = req.query;

        const result = await getSolicitudes(_id, role, { nombrePropietarioAsegurado, estadoSolicitud, fechaDesde, fechaHasta });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

solicitudesRouter.post("/send", 
    validarSolicitud ,
    async (req, res) => {
    //console.log(req.body);
    
    try {
        const result = await crearSolicitud(req.body)
        res.status(201).send(result);    
    } catch (error) {
        console.log(error.message);
        
        res.status(500).send(error.message);
    }
})

export default solicitudesRouter;