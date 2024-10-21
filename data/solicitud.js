import getConnection from "./connection.js";
import { ObjectId } from "mongodb";
import { getUser } from "./user.js";

const DATABASE = process.env.DATABASE;
const COLECCTION_SOLICITUDES = process.env.SOLICITUDES_COLECCTION;

export async function getSolicitudes() {
    const client = await getConnection();
  return client
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find()
    .toArray();
}

export async function crearSolicitud(solicitud) {
    let result = null;
    const client = await getConnection();
    //TODO VALIDAR QUE LA SOLICITUD NO EXISTA
    //const result = 

    result = await guardarSolicitud(client, solicitud)

    return result;
}

async function guardarSolicitud(client, solicitud){
    const asegurado = await getUser(solicitud.propietarioAsegurado)
    const data ={
        daniosVehiculoAsegurado: solicitud.daniosVehiculoAsegurado,
        daniosVehiculoAfectado: solicitud.daniosVehiculoAfectado,
        propietarioAsegurado: asegurado,
        conductorAsegurado: solicitud.conductorAsegurado,
        propietarioAfectado: solicitud.propietarioAfectado,
        conductorAfectado: solicitud.conductorAfectado,
        lesiones: solicitud.lesiones,
        datosSiniestro: solicitud.datosSiniestro
    }
    
    return client
    .db(DATABASE)
    .collection(COLECCTION_SOLICITUDES)
    .insertOne(data);
}
