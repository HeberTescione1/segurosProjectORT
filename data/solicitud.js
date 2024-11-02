import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLECCTION_SOLICITUDES = process.env.SOLICITUDES_COLECCTION;

export async function getSolicitudes(_id, role) {
  
    const client = await getConnection();
    const query = role === "asegurador" 
    ? { idAsegurador: _id } 
    : { idAsegurado: _id };
  return client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .find(query)
    .toArray({});
}

export async function crearSolicitud(solicitud) {
    let result = null;
    const client = await getConnection();
    //TODO VALIDAR QUE LA SOLICITUD NO EXISTA

    return client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .insertOne(solicitud);
}

