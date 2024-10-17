import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLECCTION_USERS = process.env.USERS_COLECCTION;
const COLECCTION_POLIZAS = process.env.POLIZAS_COLECCTION;

export async function addPoliza(poliza) {
  let result = null;
  const clientmongo = await getConnection();
  const polizaExist = await buscarPolizaPorDominio(
    clientmongo,
    poliza.dniAsegurado
  );
  console.log(polizaExist);
  if (!polizaExist) {
    const asegurado = await buscarAseguradoPorDni(
      clientmongo,
      poliza.dniAsegurado
    );
    if (asegurado) {
      result = await guardarPoliza(clientmongo, poliza, asegurado);
    }
  }

  return result;
}

function buscarPolizaPorDominio(clientmongo, dominio) {
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOne({ dominio: dominio });
}

function buscarAseguradoPorDni(clientmongo, dni) {
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_USERS)
    .findOne({ dni: dni });
}

function guardarPoliza(clientmongo, poliza, asegurado) {
  const data = {
    dominio: poliza.dominio,
    asegurado: new ObjectId(asegurado._id),
    asegurador: new ObjectId(poliza.aseguradorId),
  };
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .insertOne(data);
}

export async function getPolizas(aseguradorId, role) {
  const clientmongo = await getConnection();
  const query = role === "asegurador" 
    ? { asegurador: new ObjectId(aseguradorId) } 
    : { asegurado: new ObjectId(aseguradorId) };
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find()
    .toArray();
}

export async function getPolizasAsegurado(aseguradoId) {
  const clientmongo = await getConnection();
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find({ asegurado: new ObjectId(aseguradoId) })
    .toArray();
}