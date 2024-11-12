import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLECCTION_SOLICITUDES = process.env.SOLICITUDES_COLECCTION;


export async function getSolicitudes(_id, role, filtros = {}) {
  const client = await getConnection();
  const db = client.db(DATABASE);
  const collection = db.collection(COLECCTION_SOLICITUDES);

  const query =
    role === "asegurador" ? { idAsegurador: _id } : { idAsegurado: _id };

  if (filtros.nombrePropietarioAsegurado) {
    query["propietarioAsegurado.datosPersona.nombreCompleto"] = {
      $regex: filtros.nombrePropietarioAsegurado,
      $options: "i",
    };
  }
  if (filtros.estadoSolicitud) {
    query.estado = filtros.estadoSolicitud;
  }
  if (filtros.fechaOcurrencia) {
    query["datosSiniestro.fechaOcurrencia"] = {};
    if (filtros.fechaOcurrencia) {
      query["datosSiniestro.fechaOcurrencia"].$gte = filtros.fechaOcurrencia;
    }
  }
  return await collection.find(query).toArray();
}

export async function crearSolicitud(solicitud) {
  let result = null;
  const client = await getConnection();
  //TODO VALIDAR QUE LA SOLICITUD NO EXISTA

  delete solicitud._id;

  return client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .insertOne(solicitud);
}

export async function getSolicitud(_id) {
  console.log(COLECCTION_SOLICITUDES);
  const client = await getConnection();
  const solicitud = await client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .findOne({ _id: new ObjectId(_id) });

  return solicitud;
}

export async function modificarEstadoSolicitud(_id, nuevoEstado) {
  try {
      const client = await getConnection();
      const result = await client
          .db(DATABASE)
          .collection(COLECCTION_SOLICITUDES)
          .updateOne({ _id: new ObjectId(_id) }, { $set: { "estado": nuevoEstado } });
      return result;
  } catch (error) {
      console.error("Error al actualizar el estado de la solicitud:", error);
      return null;
  }
}

export async function tieneSolicitudesPendientes(polizaId) {
  const clientmongo = await getConnection();
  const solicitudesPendientes = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .find({ idPoliza: new ObjectId(polizaId), estado: "PENDIENTE" })
    .toArray();
  return solicitudesPendientes.length > 0;
}