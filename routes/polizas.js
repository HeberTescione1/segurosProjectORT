import express from "express";
import { addPoliza, getPolizas,getPolizaDominio, eliminarPoliza, actualizarPoliza, getPolizasAsegurado } from "../data/poliza.js";
import auth from "../middleware/auth.js";
import { verificarRolAdministrador, verificarRolAsegurado, verificarRolAsegurador, verificarRolesPrimarios } from "../middleware/roles.js";
import validarBodyPoliza from "../validaciones/validarBodyPoliza.js";
import { tieneSolicitudesPendientes } from "../data/solicitud.js";


const polizasRouter = express.Router();

const ROLE_ASEGURADOR = "asegurador";

const MSG_ERROR_VALIDACION = "Debe especificar todos los campos.";
const MSG_ERROR_POLIZA_EXISTE = "La poliza ya se encuentra registrada.";
const MSG_ERROR_PERMISOS = "No tiene permisos para realizar esta acción.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const MSG_ERROR_SOLICITUDES_PENDIENTES = "No se puede eliminar la póliza porque tiene solicitudes pendientes.";


//middleware de rol asegurador.
//hay que ver que mas hace falta validar.
polizasRouter.post("/register", auth, verificarRolAsegurador, async (req, res) => {
  try {
    const { _id } = req.user;

    const validationError = validarBodyPoliza(req.body);

    if (validationError) {
      return res.status(422).send(validationError);
    }
    const { dni, aseguradora , primaSegura, deducible ,tipoCobertura, dominio, marca, modelo, anio, color, tipoVehiculo, numeroIdentificador } = req.body;
    const vehiculo = {
      dominio,
      marca,
      modelo,
      anio,
      color,
      tipoVehiculo,
      numeroIdentificador
    };

    const nuevaPoliza ={
      dni, 
      aseguradora , 
      primaSegura, 
      deducible, 
      tipoCobertura,
      vehiculo,
      aseguradorId: _id
    }
    const result = await addPoliza(nuevaPoliza);
    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_POLIZA_EXISTE });
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Listar todas las polizas del asegurador al ingresar a la app

//middleware de autentificacion y asegurador
polizasRouter.get("/list", auth, verificarRolesPrimarios, async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { dominio, asegurado, tipoCobertura } = req.query;

    const result = await getPolizas(_id, role, { dominio: dominio?.toUpperCase(), asegurado, tipoCobertura });

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
//Listar todas las polizas del asegurado
polizasRouter.get("/listAsegurado/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ MSG_ERROR_PERMISOS });
    }
    const aseguradoId = req.params.id; 
    const result = await getPolizasAsegurado(aseguradoId); 
    console.log("2asd0");
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

polizasRouter.get("/buscarPolizaPorDominio", auth, async (req,res) =>{
  
  try {
    const {dominio} = req.query
    const poliza = await getPolizaDominio(dominio)

    res.status(200).send(poliza)
  } catch (error) {
    res.status(500).send(error.message);
  }
})


polizasRouter.delete("/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }

    // Verificar si la póliza tiene solicitudes pendientes
    const tienePendientes = await tieneSolicitudesPendientes(req.params.id);
    if (tienePendientes) {
      return res.status(409).send({ error: MSG_ERROR_SOLICITUDES_PENDIENTES });
    }

    const result = await eliminarPoliza(req.params.id);
    if (!result) {
      return res.status(404).send({ error: "La poliza no existe." });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

polizasRouter.put("/:id", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }

    const polizaExistente = await getPolizas(_id, role, false, req.params.id);
    if (polizaExistente.length === 0) {	
      return res.status(404).send({ error: "La póliza no existe." });
    }

    const resultado = await actualizarPoliza(req.params.id, req.body);
    res.status(200).send(resultado);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
});



export default polizasRouter;
