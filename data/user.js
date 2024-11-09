import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import e from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const MSG_ERROR_INVALID_MAIL = "Mail invalido."

const DATABASE = process.env.DATABASE;
const COLECCTION = process.env.USERS_COLECCTION;
const EXCEPTION_STRATEGY = {
  blocked: () => { throw new Error('Su usuario se encuentra bloqueado, consulte con su administrador.'); },
  unverify: () => { throw new Error('Su usuario esta en proceso de verificación, aguarde la acción de su administrador.'); },
  payment_blocked: () => { throw new Error('Su usuario se encuentra bloqueado por falta de pago.'); },
};
const ACTIVE_STATE = "active";
const MAX_ATTEMPS = 3;

export async function getUserByToken(token) {
  const info = jwt.decode(token);

  const {_id} = info

  const result = getUserById(_id)
  return result;
}

export async function getUserById(id) {
  const client = await getConnection();
  const user = await client
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ _id: new ObjectId(id) });
  return user;
}

export async function addUser(userData) {
  const clientmongo = await getConnection();
  userData.password = await bcryptjs.hash(userData.dni, 10);

  const estaDuplicado = await checkDuplicateEmailOrDni(null, userData.email, userData.dni);
  if (estaDuplicado) {
    return { success: false, error: {error: 'El correo electrónico o DNI ya está en uso.'} };
  }

  const [year, month, day] = userData.date_of_birth.split('-');
  userData.date_of_birth = `${year}-${month}-${day}`;

  userData.asegurador = new ObjectId(userData.asegurador);

  const result = await clientmongo
  .db(DATABASE)
  .collection(COLECCTION)
  .insertOne(userData);

  return result
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

  if (user.state != ACTIVE_STATE && EXCEPTION_STRATEGY[user.state]) {
    EXCEPTION_STRATEGY[state]();
  } 

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    //voy a sumar attemps a un campo attemps.
    if(user.attemps > MAX_ATTEMPS){
      throw new Error("Su usuario ha sido bloqueado por seguridad.");
      //deberia pasar el usuario a bloqueado.
    } else{
      throw new Error("Credenciales no validas");
    }
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

export async function checkDuplicateEmailOrDni(userId, email, dni) {
  const clientmongo = await getConnection();
  const query = {
    $or: [{ email }, { dni }],
    _id: { $ne: new ObjectId(userId) }, // Excluir el usuario actual
  };

  const user = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne(query);
  return !!user;
}

export async function updateUser(id, user) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(user._id) };

/*   console.log("UpdateUser - Query:", query);
  console.log("UpdateUser - User object:", user);
  console.log("UpdateUser - ID:", id);
  console.log("UpdateUser - EMAIL:", user.email);
  console.log("UpdateUser - NAME:", user.name);
  console.log("UpdateUser - LASTNAME:", user.lastname);
  console.log("UpdateUser - DNI:", user.dni);
  console.log("UpdateUser - PHONE:", user.phone);
  console.log("UpdateUser - CUIT:", user.cuit);

  console.log("--------------------");  
  console.log("UpdateUser - DOMICILIO - ADDRESS:", user.domicile.address);
  console.log("UpdateUser - DOMICILIO - ZIP_CODE:", user.domicile.zip_code);
  console.log("UpdateUser - DOMICILIO - PROVINCE:", user.domicile.province);
  console.log("UpdateUser - DOMICILIO - COUNTRY:", user.domicile.country);
  console.log("--------------------"); */

  const newValues = {
    $set: {
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      dni: user.dni,
      phone: user.phone,
      cuit: user.cuit,
      domicile: {
        address: user.address,
        zip_code: user.zip_code,
        province: user.province,
        country: user.country,
      },
    },
  };

  console.log("UpdateUser - New Values:", newValues);

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(query, newValues);
  return result.modifiedCount > 0; // Verifica si se modificó algún documento
}

export async function changeState(id, estado) {
  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: estado },
      { returnDocument: "after" }
    );

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

export async function getClientsByAsegurador(
  aseguradorId,
  { search, dni, email, phone, estado }
) {
  const clientmongo = await getConnection();

  // Crear el filtro base por asegurador y rol "asegurado"
  let query = { asegurador: new ObjectId(aseguradorId), role: "asegurado" };

  // Aplicar filtros condicionalmente
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
    ];
  }

  if (dni) {
    query.dni = dni;
  }

  if (email) {
    query.email = email;
  }

  if (phone) {
    query.phone = phone;
  }

  if (estado) {
    query.estado = estado;
  }

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

export async function mailExist(email) {

  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ email: email });

    if(result == null){
      throw new Error(MSG_ERROR_INVALID_MAIL)
    }

    return result
}

export async function changePassword(newPass, id) { 
  const clientmongo = await getConnection();
  const newPassHash = await bcryptjs.hash(newPass, 10);

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) }, 
      { $set: { password: newPassHash } }, 
      { returnOriginal: true } 
    );    

    return result  
}

export async function generateTokenResetPass(user) {
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.CLAVE_SECRETA,
    { expiresIn: "5m" }
  );
  return token;
}
