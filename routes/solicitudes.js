import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";
import validarDuenio  from "../validaciones/validarDuenio.js";
import {modificarEstadoSolicitud} from "../data/solicitud.js";

import {getSolicitudes, crearSolicitud, getSolicitud } from "../data/solicitud.js"

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const ROLE_ASEGURADOR = "asegurado"

solicitudesRouter.get("/list", auth, async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { nombrePropietarioAsegurado, estadoSolicitud, fechaOcurrencia} = req.query;

        const result = await getSolicitudes(_id, role, { nombrePropietarioAsegurado, estadoSolicitud, fechaOcurrencia });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

solicitudesRouter.post("/send", 
    validarSolicitud ,
    async (req, res) => {
    try {
        const result = await crearSolicitud(req.body)
        res.status(201).send(result);    
    } catch (error) {
        res.status(500).send(error.message);
    }
})

solicitudesRouter.get("/buscarSolicitud", auth, async (req, res) => {
    
    try {
        const {idSolicitud} = req.query;
        const solicitud = await getSolicitud (idSolicitud);

        if(!validarDuenio(solicitud.idAsegurado, req)){
            return res.status(403).send("No tienes permiso para acceder a esta solicitud");
        }
        res.status(200).send(solicitud);
    } catch (error) {
        res.status(500).send(error.message);
        
    }
})


//endpoint para modificar el estado de una solicitud
solicitudesRouter.put("/modificarEstado", auth, async (req, res) => {
    try {
        const { idSolicitud, nuevoEstado } = req.body;
        const solicitud = await getSolicitud(idSolicitud);
        if (!solicitud) {
            return res.status(404).send("Solicitud no encontrada");
        }

        const result = await modificarEstadoSolicitud(idSolicitud, nuevoEstado);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



export default solicitudesRouter;