import { sendEmailToExternalAPI } from "../utils/mails.js";
import getConnection from "./connection.js";
import { ObjectId } from "mongodb";
import { eliminarSolicitud, getSolicudesByPoliza } from "./solicitud.js";

const DATABASE = process.env.DATABASE;
const COLECCTION_USERS = process.env.USERS_COLECCTION;
const COLECCTION_POLIZAS = process.env.POLIZAS_COLECCTION;

//Roles
const ROLE_ASEGURADOR = "asegurador";

//Mensajes
const MSG_ERROR_VIN =
  "El Número identificador (VIN) ya existe asociado a otro vehículo.";
const MSG_ERROR_ASEGURADO =
  "El asegurado no es cliente suyo. No se registra la poliza.";
const MSG_ERROR_POLIZA_EXISTE = "La poliza ya existe";
const MSG_ERROR_ASEGURADO_NO_EXISTE = "No existe el asegurado";
const MSG_ERROR_CLIENTE_NO_ENCONTRADO = "Cliente no encontrado";

export async function addPoliza(poliza) {
  let result = null;
  const clientmongo = await getConnection();
  const polizaExist = await getPolizaDominio(poliza.vehiculo.dominio);
  const identificarExtiste = await getPolizaByIdentificador(
    poliza.vehiculo.numeroIdentificador
  );
  if (identificarExtiste) {
    throw new Error(MSG_ERROR_VIN);
  }
  if (!polizaExist) {
    const asegurado = await buscarAseguradoPorDni(clientmongo, poliza.dni);
    const idAsegurador = new ObjectId(poliza.aseguradorId);
    if (!idAsegurador.equals(asegurado.asegurador)) {
      throw new Error(MSG_ERROR_ASEGURADO);
    }
    if (asegurado) {
      result = await guardarPoliza(clientmongo, poliza, asegurado);
      const emailData = {
        to: asegurado.email,
        subject: "Alta de poliza",
        template: "altaPoliza",
        params: {
          aseguradoName: `${asegurado.lastname}, ${asegurado.name}`,
          poliza: poliza,
        },
      };
      try {
        sendEmailToExternalAPI(emailData);
      } catch (error) {
      }
    }
  } else {
    throw new Error(MSG_ERROR_POLIZA_EXISTE);
  }

  return result;
}

export async function getPolizas(
  aseguradorId,
  role,
  { dominio, asegurado, tipoCobertura },
  polizaId = null
) {
  const clientmongo = await getConnection();
  let query =
    role === ROLE_ASEGURADOR
      ? { asegurador: new ObjectId(aseguradorId) }
      : { asegurado: new ObjectId(aseguradorId) };

  if (dominio) {
    query.dominio = { $regex: dominio, $options: "i" };
  }

  if (asegurado) {
    query.asegurado = new ObjectId(asegurado);
  }

  if (tipoCobertura) {
    query.tipoCobertura = tipoCobertura;
  }

  if (polizaId) {
    query._id = new ObjectId(polizaId);
  }

  const polizas = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find(query)
    .toArray();

  const polizasWithClientNames = await Promise.all(
    polizas.map(async (poliza) => {
      const cliente = await clientmongo
        .db(DATABASE)
        .collection(COLECCTION_USERS)
        .findOne({ _id: new ObjectId(poliza.asegurado) });

      return {
        ...poliza,
        aseguradoName: cliente ? cliente.name : MSG_ERROR_CLIENTE_NO_ENCONTRADO,
        aseguradoLastName: cliente
          ? cliente.lastname
          : MSG_ERROR_CLIENTE_NO_ENCONTRADO,
      };
    })
  );

  return polizasWithClientNames;
}

export async function getPolizaDominio(dominio) {
  const client = await getConnection();
  const poliza = await client
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOne({ dominio: dominio });

  return poliza;
}

export async function getPolizasAsegurado(aseguradoId) {
  const clientmongo = await getConnection();
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find({ asegurado: new ObjectId(aseguradoId) })
    .toArray();
}

export async function eliminarPoliza(id) {
  const clientmongo = await getConnection();
  const poliza = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOne({ _id: new ObjectId(id) });
  const solicitudes = await getSolicudesByPoliza(poliza._id);
  solicitudes.map(async (solicitud) => {
    await eliminarSolicitud(solicitud._id);
  });
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .deleteOne({ _id: new ObjectId(id) });
  return result;
}

export async function actualizarPoliza(id, datosActualizados) {
  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: datosActualizados },
      { returnDocument: "after" }
    );

  return result;
}

async function buscarAseguradoPorDni(clientmongo, dni) {
  const asegurado = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_USERS)
    .findOne({ dni: dni });

  if (!asegurado) {
    throw new Error(MSG_ERROR_ASEGURADO_NO_EXISTE);
  }

  return asegurado;
}

async function getPolizaByIdentificador(identificador) {
  const client = await getConnection();
  const poliza = await client
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOne({ "vehiculo.numeroIdentificador": identificador });

  return poliza;
}

function guardarPoliza(clientmongo, poliza, asegurado) {
  const data = {
    asegurado: new ObjectId(asegurado._id),
    asegurador: new ObjectId(poliza.aseguradorId),
    dominio: poliza.vehiculo.dominio,
    tipoCobertura: poliza.tipoCobertura,
    aseguradora: poliza.aseguradora,
    primaSegura: poliza.primaSegura,
    deducible: poliza.deducible,
    vehiculo: {
      numeroIdentificador: poliza.vehiculo.numeroIdentificador,
      marca: poliza.vehiculo.marca,
      modelo: poliza.vehiculo.modelo,
      anio: poliza.vehiculo.anio,
      dominio: poliza.vehiculo.dominio,
      color: poliza.vehiculo.color,
      tipoVehiculo: poliza.vehiculo.tipoVehiculo,
    },
  };
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .insertOne(data);
}
