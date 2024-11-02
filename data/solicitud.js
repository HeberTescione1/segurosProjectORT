import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLECCTION_SOLICITUDES = process.env.SOLICITUDES_COLECCTION;

export async function getSolicitudes(_id, role, filtros = {}) {
  const client = await getConnection();
  const db = client.db(DATABASE);
  const collection = db.collection(COLECCTION_SOLICITUDES);

  const query = role === "asegurador" ? { idAsegurador: _id } : { idAsegurado: _id };

  if (filtros.nombrePropietarioAsegurado) {
    query["propietarioAsegurado.datosPersona.nombreCompleto"] = { $regex: filtros.nombrePropietarioAsegurado, $options: "i" };
  }
  if (filtros.estadoSolicitud) {
      query.estado = filtros.estadoSolicitud;
  }
  if (filtros.fechaDesde || filtros.fechaHasta) {
      query["datosSiniestro.fechaOcurrencia"] = {};
      if (filtros.fechaDesde) {
          query["datosSiniestro.fechaOcurrencia"].$gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
          query["datosSiniestro.fechaOcurrencia"].$lte = filtros.fechaHasta;
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
  
  const client = await getConnection();
  const solicitud = await client
  .db(DATABASE)
  .collection(COLECCTION_SOLICITUDES)
  .findOne({_id: new ObjectId(_id)}); 

  return solicitud;
}
