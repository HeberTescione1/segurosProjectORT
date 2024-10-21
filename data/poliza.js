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
    asegurado: new ObjectId(asegurado._id),
    asegurador: new ObjectId(poliza.aseguradorId),
    dominio: poliza.vehiculo.dominio,
    tipoCobertura : poliza.tipoCobertura,
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
        tipoVehiculo: poliza.vehiculo.tipoVehiculo
    }
  };
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .insertOne(data);
}

export async function getPolizas(aseguradorId) {
  const clientmongo = await getConnection();
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

export async function getPoliza(_id) {
  const clientmongo = await getConnection();
  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .findOne({ _id: new ObjectId(_id) });
}

export async function getPolizaAsegurado(idUser, idPoliza) {
  const poliza = await getPoliza(idPoliza);

  if(!poliza){
    throw new Error('La poliza no existe.')
  }else if (poliza.asegurado.toString() !== idUser) {
    throw new Error('El usuario no tiene esa poliza.')
  }
  
  return poliza
}