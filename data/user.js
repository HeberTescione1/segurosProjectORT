import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import e from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import {
  getUserByEmail,
  checkUserState,
  comparePassword,
  updateFailedAttempts,
  initializeAttempts,
  blockUser,
  resetAttempts,
} from "../utils/users.js";
import { sendEmailToExternalAPI } from "../utils/mails.js";
import { eliminarPoliza, getPolizasAsegurado } from "./poliza.js";
import { eliminarSolicitud, getSolicudesByPoliza } from "./solicitud.js";

const MSG_ERROR_INVALID_MAIL = "Email invalido.";

const DATABASE = process.env.DATABASE;
const COLECCTION = process.env.USERS_COLECCTION;
const ACTIVE_STATE = "active";
const MAX_ATTEMPS = 3;
const BLOCKED_STATE = "blocked";
const MSG_BLOCKED_STATE = "Su usuario ha sido bloqueado por seguridad.";
const MSG_INVALID_CREDENTIALS = "Credenciales no validas";

const TRANSITION_STRATEGIES = {
  unverify_to_active: () => {
    return {
      emailTemplate: "usuarioVerificado",
      subject: "Verificación exitosa",
      refreshPassword: false,
    };
  },

  blocked_to_active: () => {
    return {
      emailTemplate: "usuarioReactivado",
      subject: "Usuario activado",
      refreshPassword: true,
    };
  },

  active_to_payment_blocked: () => {
    return {
      emailTemplate: "usuarioNoPago",
      subject: "Suscripción impaga",
      refreshPassword: false,
    };
  },
  payment_blocked_to_active: () => {
    return {
      emailTemplate: "usuarioPago",
      subject: "Reactivación de cuenta por pago existoso",
      refreshPassword: false,
    };
  },
};

export async function getUserByToken(token) {
  const info = jwt.decode(token);

  const { _id } = info;

  const result = await getUserById(_id);

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
  const estaDuplicado = await checkDuplicateEmailOrDni(
    null,
    userData.email,
    userData.dni
  );
  if (estaDuplicado) {
    throw new Error("El correo electrónico o DNI ya está en uso.");
  }
  const [year, month, day] = userData.date_of_birth.split("-");
  userData.date_of_birth = `${year}-${month}-${day}`;

  userData.asegurador = new ObjectId(userData.asegurador);

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .insertOne(userData);

  const asegurador = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ _id: userData.asegurador });

  const emailData = {
    to: userData.email,
    subject: "Bienvenido/a a Grupo 5 - Seguros",
    template: "bienvenidaAseguradoNuevo",
    params: {
      aseguradoName: `${userData.lastname}, ${userData.name}`,
      aseguradorName: `${asegurador.lastname}, ${asegurador.name}`,
    },
  };
  try {
    sendEmailToExternalAPI(emailData);
  } catch (error) {
    console.log(error);
  }
  return result;
}

export async function findByCredential(email, password) {
  const clientmongo = await getConnection();
  const user = await getUserByEmail(clientmongo, email);
  initializeAttempts(user);
  checkUserState(user);
  const isMatch = await comparePassword(user, password);

  if (!isMatch) {
    const newAttempts = user.attemps + 1;

    if (newAttempts >= MAX_ATTEMPS) {
      await blockUser(clientmongo, email);
      const emailData = {
        to: user.email,
        subject: "Bloqueo de usuario",
        template: "usuarioBloqueado",
        params: {
          name: `${user.lastname}, ${user.name}`,
        },
      };
      try {
        sendEmailToExternalAPI(emailData);
      } catch (error) {
        console.log(error);
      }
      throw new Error(MSG_BLOCKED_STATE);
    } else {
      await updateFailedAttempts(clientmongo, email, newAttempts);
      throw new Error(MSG_INVALID_CREDENTIALS);
    }
  }
  await resetAttempts(clientmongo, email);
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

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(query, newValues);
  return result.modifiedCount > 0; // Verifica si se modificó algún documento
}

export async function updatePerfil(id, user) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(id) };
  const newValues = {
    $set: {
      phone: user.phone,
      domicile: {
        address: user.address,
        number: user.number,
        floor: user.floor,
        apartment: user.apartment,
        zip_code: user.zip_code,
      },
    },
  };

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(query, newValues);
  return result.modifiedCount > 0; // Verifica si se modificó algún documento
}

export async function changeState(user, newState) {
  const transitionKey = `${user.state}_to_${newState}`;
  let transition = null;
  let query = { $set: { state: newState, attempts: 0 } };
  let emailData = null;
  if (TRANSITION_STRATEGIES[transitionKey]) {
    transition = TRANSITION_STRATEGIES[transitionKey]();
    emailData = {
      to: user.email,
      subject: transition.subject,
      template: transition.emailTemplate,
      params: {
        name: `${user.lastname}, ${user.name}`,
      },
    };
    if (transition.refreshPassword) {
      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      query.$set.password = hashedPassword;
      emailData.params.newPassword = newPassword;
    }
  } else {
    throw new Error("No existe la transicion de estados que desea realizar.");
  }
  const clientmongo = await getConnection();
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOneAndUpdate({ _id: new ObjectId(user._id) }, query, {
      returnDocument: "after",
    });
  try {
    console.log(emailData);
    sendEmailToExternalAPI(emailData);
  } catch (error) {
    console.log(error);
  }
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
  { search, dni, email, phone, state }
) {
  const clientmongo = await getConnection();
  let query = { asegurador: new ObjectId(aseguradorId), role: "asegurado" };

  // Construir la consulta con los filtros dados
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
    ];
  }
  if (dni) {
    query.$or = [{ dni: { $regex: dni, $options: "i" } }];
  }
  if (email) {
    query.$or = [{ email: { $regex: email, $options: "i" } }];
  }
  if (phone) {
    query.$or = [{ phone: { $regex: phone, $options: "i" } }];
  }
  if (state) {
    query.state = state;
  }

  const clients = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .find(query)
    .project({
      _id: 1,
      name: 1,
      lastname: 1,
      dni: 1,
      email: 1,
      phone: 1,
      state: 1,
    })
    .toArray();

  return clients;
}

export async function deleteUser(id) {
  const clientmongo = await getConnection();
  const cliente = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ _id: new ObjectId(id) });
  if (cliente) {
    await eliminarDatosAsociados(cliente);
  }
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

  if (result == null) {
    throw new Error(MSG_ERROR_INVALID_MAIL);
  }

  return result;
}

export async function changePassword(newPass, id) {
  const clientmongo = await getConnection();
  const newPassHash = await bcryptjs.hash(newPass, 10);

  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { password: newPassHash, state: "active" } },
      { returnOriginal: true }
    );

  return result;
}

export async function generateTokenResetPass(user) {
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.CLAVE_SECRETA,
    { expiresIn: "5m" }
  );
  return token;
}

export async function addAsegurador(userData) {
  const clientmongo = await getConnection();
  const estaDuplicado = await checkDuplicateEmailOrDni(
    null,
    userData.email,
    userData.dni
  );
  if (estaDuplicado) {
    throw new Error("El correo electrónico o DNI ya está en uso.");
  }
  userData.password = await bcryptjs.hash(userData.password, 10);
  userData.state = "unverify";
  const result = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .insertOne(userData);

  /* emailData */
  const emailData = {
    to: userData.email,
    subject: "Bienvenido/a a Grupo 5 - Seguros",
    template: "bienvenidaAseguradorNuevo",
    params: {
      aseguradorName: `${userData.lastname}, ${userData.name}`,
    },
  };
  sendEmailToExternalAPI(emailData);

  return result;
}

export async function getAseguradores(search, dni, email, state) {
  let query = { role: "asegurador" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
    ];
  }
  if (dni) {
    query.$or = [{ dni: { $regex: dni, $options: "i" } }];
  }
  if (email) {
    query.$or = [{ email: { $regex: email, $options: "i" } }];
  }
  if (state) {
    query.state = state;
  }
  const clientmongo = await getConnection();
  const clients = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .find(query)
    .project({
      _id: 1,
      name: 1,
      lastname: 1,
      dni: 1,
      email: 1,
      phone: 1,
      state: 1,
    })
    .toArray();

  return clients;
}

async function eliminarDatosAsociados(cliente) {
  try {
    const polizas = await getPolizasAsegurado(cliente._id);
    const solicitudesPorPoliza = await Promise.all(
      polizas.map(async (poliza) => {
        const solicitudes = await getSolicudesByPoliza(poliza._id);
        return {
          solicitudes,
        };
      })
    );
    polizas.map(async (poliza) => {
      await eliminarPoliza(poliza._id);
    });
    solicitudesPorPoliza.map(async (solicitud) => {
      const solicitudes = solicitud.solicitudes;
      solicitudes.map(async (solicitud) => {
        await eliminarSolicitud(solicitud._id);
      });
    });
  } catch (error) {
    throw new Error("Error al eliminar la información asociado al cliente");
  }
}
