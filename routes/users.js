import express from "express";
import {
  addUser,
  findByCredential,
  generateAuthToken,
  updateUser,
  addClient,
  getUserByToken,
  getClientsByAsegurador,
  checkDuplicateEmailOrDni,
  deleteUser,
} from "../data/user.js";
import auth from "../middleware/auth.js";
import validator from "validator";
import {
  validarContrasena,
  validarBodyRegistro,
  validarBodySinPassword,
} from "../validaciones/validaciones.js";
import acceso from "../middleware/acceso.js";

const usersRouter = express.Router();
const MSG_ERROR_409 =
  "El dni o el mail ya se encuentra registrado en nuestra base de datos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const MSG_ERROR_LOGIN_VACIO =
  "Faltan campos obligatorios: se requieren email y contraseña.";
const MSG_ERROR_EMAIL_INVALIDO =
  "El email proporcionado no tiene formato de email.";
const ROLE_ASEGURADOR = "asegurador";
const ROLE_ASEGURADO = "asegurado";
const ROLE_ADMIN = "admin";

usersRouter.get("/buscarCliente/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRouter.put("/editarCliente/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }

    // Verificar duplicados
    const duplicate = await checkDuplicateEmailOrDni(
      req.params.id,
      req.body.email,
      req.body.dni
    );
    if (duplicate) {
      return res.status(400).send({
        error:
          "El dni o el mail ya se encuentra registrado en nuestra base de datos.",
      });
    }

    const result = await updateUser(req.params.id, req.body);
    if (!result) {
      return res
        .status(404)
        .send({ error: "El usuario no existe o no se pudo actualizar." });
    }

    res.status(200).send({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//  Validaciones
//  email         usuario@dominio.algo
//  dni           numeros igual o mas de 7 numeros y igual o menos a 8
//  contraseña    Se setea contraseña "D{dni usuario}!"
//falta validar cuit, domicilio y no se si algo mas.
usersRouter.post("/register/client", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ MSG_ERROR_401 });
    }
    req.body.password = `D${req.body.dni}!`;
    const errores = validarBodyRegistro(req.body);
    if (!validator.isEmpty(errores)) {
      return res.status(422).send({ error: errores });
    }
    req.body.role = ROLE_ASEGURADO;

    const userInserted = await addUser(req.body);
    if (!userInserted) {
      return res.status(409).send({ error: MSG_ERROR_409 });
    }

    const result = await addClient({
      aseguradorId: _id,
      clienteId: userInserted.insertedId,
    });

    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_409 });
    }
    res.status(201).send("Cliente agregado correctamente.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//no tiene validaciones de campos
usersRouter.delete("/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }
    const result = await deleteUser(req.params.id);
    if (!result) {
      return res.status(404).send({ error: "El usuario no existe." });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//no tiene validaciones de campos
usersRouter.get("/clients", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }

    const { search, dni, email, phone, cuit } = req.query; // Agregar phone y cuit a los filtros

    // Obtener los clientes relacionados con el asegurador y aplicar filtros
    const clients = await getClientsByAsegurador(_id, {
      search,
      dni,
      email,
      phone,
      cuit,
    });

    res.status(200).send(clients);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

usersRouter.post("/getInfoByToken", async (req, res) => {
  try {
    //TODO VALIDAR QUE EL USER EXISTA
        
    const result = await getUserByToken(req.body.token)

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//  Validaciones
//  email         usuario@dominio.algo
//  dni           numeros igual o mas de 7 numeros y igual o menos a 8
//  contraseña    mayuscula, caracter especial y numero, 8 o mas caracteres
usersRouter.post("/register", async (req, res) => {
  try {
    const errores = validarBodyRegistro(req.body);
    if (!validator.isEmpty(errores)) {
      return res.status(422).send({ error: errores });
    }
    req.body.role = ROLE_ASEGURADOR;
    const result = await addUser(req.body);
    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_409 });
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//  Validaciones
//  email   usuario@dominio.algo
usersRouter.post("/login", acceso, async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"];

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        error: MSG_ERROR_LOGIN_VACIO,
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).send({
        error: MSG_ERROR_EMAIL_INVALIDO,
      });
    }
    const user = await findByCredential(email, password);
    console.log(user);
    if (user.role === "asegurado" && req.isWeb) {
      return res
        .status(403)
        .send({ error: "No posee permisos para acceder desde una web." });
    }
    if (user.role === "asegurador" && req.isAndroid) {
      return res.status(403).send({
        error: "No posee permisos para acceder desde un dispositivo Android.",
      });
    }
    const token = await generateAuthToken(user);
    res.status(200).send({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

export default usersRouter;
