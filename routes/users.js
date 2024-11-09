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
  getUserById,
  changeState,
  addAsegurador,
} from "../data/user.js";
import auth from "../middleware/auth.js";
import validator from "validator";
import {
  validarContrasena,
  validarBodyRegistro,
  validarBodySinPassword,
} from "../validaciones/validaciones.js";
import acceso from "../middleware/acceso.js";
import {
  verificarRolAsegurado,
  verificarRolAsegurador,
  verificarRolAdministrador,
} from "../middleware/roles.js";
import validarBodyCliente from "../validaciones/validarBodyCliente.js";
import validarAsegurador from "../validaciones/validarAsegurador.js";
import validarAseguradorCorrecto from "../validaciones/validarAseguradorCorrecto.js";

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
const CLIENTE_ACTIVO = "ACTIVO";
const CLIENTE_INACTIVO = "INACTIVO";

//no se donde se usa esto. verificar.
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

//middleware de rol y autentificado
//falta validar lo que viene en el body
usersRouter.put(
  "/editarCliente/:id",
  auth,
  verificarRolAsegurador,
  async (req, res) => {
    try {
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
  }
);

//TODO
//validar que el productor sea prodructor y que sea el productor del usuario
usersRouter.put(
  "/editarEstado/:id",
  auth,
  verificarRolAsegurador,
  async (req, res) => {
    try {
      const idAsegurado = req.params.id;
      const { estado } = req.body;

      if (estado !== CLIENTE_ACTIVO && estado !== CLIENTE_INACTIVO) {
        return res.status(400).send({ error: "Estado Invalido." });
      }
      const clienteExiste = await getUserById(idAsegurado);
      if (!clienteExiste) {
        return res.status(404).send({ error: "El Cliente no existe." });
      }

      if (!validarAseguradorCorrecto(req, clienteExiste.asegurador)) {
        return res.status(404).send({ error: MSG_ERROR_401 });
      }

      const result = await changeState(idAsegurado, req.body);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//  Validaciones
//  email         usuario@dominio.algo
//  dni           numeros igual o mas de 7 numeros y igual o menos a 8
//  contraseña    Se setea contraseña "D{dni usuario}!" despues vemos
//falta validar cuit, domicilio y no se si algo mas.
usersRouter.post(
  "/register/client",
  auth,
  verificarRolAsegurador,
  async (req, res) => {
    try {
      const { _id } = req.user;
      const validationError = validarBodyCliente(req.body);
      if (validationError) {
        return res.status(422).send(validationError);
      }

      const {
        email,
        name,
        lastname,
        dni,
        phone,
        date_of_birth,
        gender,
        address,
        number,
        floor,
        apartment,
        zip_code,
      } = req.body;
      const domicile = {
        address,
        number,
        floor,
        apartment,
        zip_code,
      };

      const newUser = {
        email,
        name,
        lastname,
        full_name: `${name} ${lastname}`,
        dni,
        domicile,
        phone,
        date_of_birth,
        gender,
        role: "asegurado",
        asegurador: _id,
        state: "active",
      };
      const result = await addUser(newUser);
      res.status(201).send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

//no tiene validaciones de campos
//middleware de autentificado y de rol.
//FALTA VALIDAR ACA QUE NO BORRE ALGUN CLIENTE U ALGUN OTRO USUARIO DE OTRO LADO.
usersRouter.delete(
  "/:id",
  auth,
  verificarRolAsegurador || verificarRolAdministrador,
  async (req, res) => {
    try {
      const { role } = req.user;
      const result = await deleteUser(req.params.id);
      if (!result) {
        return res.status(404).send({ error: "El usuario no existe." });
      }
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//no tiene validaciones de campos
usersRouter.get("/clients", auth, verificarRolAsegurador, async (req, res) => {
  try {
    const { _id } = req.user;
    const { search, dni, email, phone, state } = req.query;
    const clients = await getClientsByAsegurador(_id, {
      search,
      dni,
      email,
      phone,
      state,
    });

    res.status(200).send(clients);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

usersRouter.post("/getInfoByToken", async (req, res) => {
  try {
    //TODO VALIDAR QUE EL USER EXISTA

    const result = await getUserByToken(req.body.token);

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
    console.log(errores);
    if (!validator.isEmpty(errores)) {
      return res.status(422).send({ error: errores });
    }
    req.body.role = ROLE_ASEGURADOR;
    const result = await addAsegurador(req.body);

    console.log(result);
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
