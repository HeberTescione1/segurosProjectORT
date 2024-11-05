import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLECCTION_USERS = process.env.USERS_COLECCTION;
const COLECCTION_POLIZAS = process.env.POLIZAS_COLECCTION;

export async function addPoliza(poliza) {
  let result = null;
  const clientmongo = await getConnection();
  const polizaExist = await getPolizaDominio(
    poliza.vehiculo.dominio
  );
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

export async function getPolizas(aseguradorId, role, {dominio}) {
  const clientmongo = await getConnection();
  let query = role === "asegurador" 
    ? { asegurador: new ObjectId(aseguradorId) } 
    : { asegurado: new ObjectId(aseguradorId) };

    if(dominio){
      query.dominio = dominio
    }
    console.log("ss", query);

  return clientmongo
    .db(DATABASE)
    .collection(COLECCTION_POLIZAS)
    .find(query)
    .toArray();
}

export async function getPolizaDominio(dominio) {
  
  const client = await getConnection();
  const poliza = await client
  .db(DATABASE)
  .collection(COLECCTION_POLIZAS)
  .findOne({dominio: dominio}); 

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
