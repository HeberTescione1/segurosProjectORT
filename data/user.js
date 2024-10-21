import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

export async function addClient(data) {
  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(
      { _id: new ObjectId(data.clienteId) },
      { $set: { asegurador: new ObjectId(data.aseguradorId) } }
    );
  return result;
}

export async function getClientsByAsegurador(aseguradorId, { search, dni, email }) {
  const clientmongo = await getConnection();

  // Crear el filtro base por asegurador y rol "asegurado"
  let query = { asegurador: new ObjectId(aseguradorId), role: "asegurado" };

  // Aplicar filtros condicionalmente
  if (search) {
    // Filtro por nombre y apellido juntos (usamos una expresión regular para hacer una búsqueda más flexible)
    query.$or = [
      { name: { $regex: search, $options: "i" } }, // "i" hace que la búsqueda no sea sensible a mayúsculas
      { lastname: { $regex: search, $options: "i" } }
    ];
  }

  if (dni) {
    // Filtro por DNI
    query.dni = dni;
  }

  if (email) {
    // Filtro por email
    query.email = email;
  }

  // Buscar clientes relacionados con el asegurador y los filtros aplicados
  const clients = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .find(query)
    .toArray();

  return clients;
}

export async function deleteUser(id) {
  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .deleteOne({ _id: new ObjectId(id) });
  return result;
}
