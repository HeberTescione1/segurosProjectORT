import getConnection from "./connection.js";
import { ObjectId } from "mongodb";
import { getUser } from "./user.js";

const DATABASE = process.env.DATABASE;
const COLECCTION_SOLICITUDES = process.env.SOLICITUDES_COLECCTION;

export async function getSolicitudes() {
    const client = await getConnection();
  return client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .find()
    .toArray();
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

