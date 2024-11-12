import express from "express";
const solicitudesRouter = express.Router();
import auth from "../middleware/auth.js";
import validarSolicitud from "../validaciones/validaciones.js";
import validarDuenio from "../validaciones/validarDuenio.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import pdf from "html-pdf";
import handlebars from "handlebars";
import validarDuenio  from "../validaciones/validarDuenio.js";
import {modificarEstadoSolicitud} from "../data/solicitud.js";

const __filename = fileURLToPath(import.meta.url); // Definir __filename una vez
const __dirname = path.dirname(__filename); // Usar __filename para obtener __dirname

import {
  getSolicitudes,
  crearSolicitud,
  getSolicitud,
} from "../data/solicitud.js";
import {
  getDatosConductorAsegurado,
  getDatosConductorDelOtroVehiculo,
  getDatosDelSiniestro,
  getDatosPropietarioDelOtroVehiculo,
  getDatosPropietarioVehiculoAsegurado,
  getInformacionAdicional,
  getDatosAdicionales,
  getConsecuenciasDelSiniestro,
  getLugarAsistencia,
} from "../utils/datosSolicitudes.js";

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const ROLE_ASEGURADOR = "asegurado";

solicitudesRouter.get("/list", auth, async (req, res) => {

  try {
    const { _id, role } = req.user;
    const { nombrePropietarioAsegurado, estadoSolicitud, fechaOcurrencia } =
      req.query;

    const result = await getSolicitudes(_id, role, {
      nombrePropietarioAsegurado,
      estadoSolicitud,
      fechaOcurrencia,
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

solicitudesRouter.post("/send", validarSolicitud, async (req, res) => {
  //console.log(req.body);

  try {
    const result = await crearSolicitud(req.body);
    res.status(201).send(result);
  } catch (error) {
    console.log(error.message);

    res.status(500).send(error.message);
  }
});
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
    const { idSolicitud } = req.query;
    const solicitud = await getSolicitud(idSolicitud);

    if (!validarDuenio(solicitud.idAsegurado, req)) {
      return res
        .status(403)
        .send("No tienes permiso para acceder a esta solicitud");
    }
    res.status(200).send(solicitud);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

solicitudesRouter.get("/getSolicitudPdf/:id", async (req, res) => {
  try {
    const solicitud = await getSolicitud(req.params.id);
    //para validar despues
    /*  if (!validarDuenio(solicitud.idAsegurado, req)) {
        return res
          .status(403)
          .send("No tienes permiso para acceder a esta solicitud");
      } */

    const datosSiniestro = getDatosDelSiniestro(solicitud);
    const informacionAdicional = getInformacionAdicional(solicitud);
    const datosPropietarioVehiculoAsegurado =
      getDatosPropietarioVehiculoAsegurado(solicitud);
    const datosPropietarioDelOtroVehiculo =
      getDatosPropietarioDelOtroVehiculo(solicitud);
    const conductorAsegurado = getDatosConductorAsegurado(solicitud);
    const conductorAfectado = getDatosConductorDelOtroVehiculo(solicitud);
    const datosAdicionales = getDatosAdicionales(solicitud);
    const consecuencias = getConsecuenciasDelSiniestro(solicitud);
    const lugarAsistencia = getLugarAsistencia(solicitud);
    const htmlFilePath = path.join(
      __dirname,
      "..",
      "utils",
      "templatePDF.html"
    );
    const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
    const data = {
      datosSiniestro: datosSiniestro,
      informacionAdicional: informacionAdicional,
      datosPropietarioVehiculoAsegurado: datosPropietarioVehiculoAsegurado,
      datosPropietarioDelOtroVehiculo: datosPropietarioDelOtroVehiculo,
      conductorAsegurado: conductorAsegurado,
      conductorAfectado: conductorAfectado,
      daniosAsegurado: solicitud.daniosVehiculoAsegurado,
      daniosAfectado: solicitud.daniosVehiculoAfectado,
      datosAdicionales: datosAdicionales,
      relato: solicitud.datosSiniestro.relato,
      consecuencias: consecuencias,
      lugarAsistencia: lugarAsistencia,
    };
    /*     fecha: new Date().toLocaleDateString(), */
    const template = handlebars.compile(htmlContent);
    const filledHtml = template(data);
    const options = {
      format: "A4",
      printBackground: true,
    };

    pdf.create(filledHtml, options).toStream((err, stream) => {
      if (err) {
        console.log("Error al generar el PDF:", err);
        return res.status(500).send("Error al generar el PDF");
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=solicitud.pdf"
      );
      stream.pipe(res); // Enviar el PDF al cliente
    });
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).send("Error al generar el PDF");
  }
});

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
