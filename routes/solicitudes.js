import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";
import validarDuenio  from "../validaciones/validarDuenio.js";

import {getSolicitudes, crearSolicitud, getSolicitud } from "../data/solicitud.js"
import { getPolizaDominio } from "../data/poliza.js";

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
    //console.log(req.body);
    
    try {
        
        const solicitud = req.body
        const dominioSolicitud = solicitud?.propietarioAsegurado?.vehiculo?.datosVehiculo?.dominio;

        if (dominioSolicitud) {
            console.log("Dominio del vehículo:", dominioSolicitud);
        } else {
            console.log("No se pudo encontrar el dominio del vehículo.");
        }
        

        if(req.body.datosSiniestro.lugarAsistencia == undefined){
            req.body.datosSiniestro.lugarAsistencia = null
        }  
        

        const poliza = await getPolizaDominio(dominioSolicitud)

        solicitud.idPoliza = poliza._id
        const result = await crearSolicitud(solicitud)
        res.status(201).send(result);    
    } catch (error) {
        console.log(error.message);
        
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



export default solicitudesRouter;