import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from 'mongodb';

const DATABASE = process.env.DATABASE;
const COLECCTION = process.env.USERS_COLECCTION;

export async function addUser(user) {
  const clientmongo = await getConnection();
  const dniExist = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ dni: user.dni });

    const emailExist = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ email: user.email });

  let result = null;
  if (!dniExist && !emailExist) {
    user.password = await bcryptjs.hash(user.password, 10);
    //user.role = "asegurado";

    result = await clientmongo
      .db(DATABASE)
      .collection(COLECCTION)
      .insertOne(user);
  }
  return result;
}

export async function findByCredential(email, password) {
  const clientmongo = await getConnection();

  const user = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ email: email });

  if (!user) {
    throw new Error("Credenciales no validas");
  }

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Credenciales no validas");
  }

  return user;
}

export async function generateAuthToken(user) {
  const token = await jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.CLAVE_SECRETA,
    { expiresIn: "1h" }
  );
  return token;
}

export async function getUser(id) {
  const clientmongo = await getConnection();

  const user = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ _id: new ObjectId(id) });

  return user;
}

export async function updateUser(user) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(user._id) };
  const newValues = {
    $set: {
      mail: user.mail,
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni,
    },
  };

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(query, newValues);
  return result;
}

export async function addClient(client) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(client.idAsegurador) };
  const update = { $push: { clients: client.idClient} };
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(query, update, { upsert: true }); 
  return result;
}

