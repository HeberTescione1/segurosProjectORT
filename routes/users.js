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
  mailExist,
  generateTokenResetPass,
  changePassword,
  addAsegurador,
  getAseguradores,
  updatePerfil,
} from "../data/user.js";
import auth from "../middleware/auth.js";
import validator from "validator";
import {
  validarContrasena,
  validarBodyRegistro,
  validarBodySinPassword,
  validateOldPassword,
} from "../validaciones/validaciones.js";
import acceso from "../middleware/acceso.js";
import {
  verificarRolAsegurado,
  verificarRolAsegurador,
  verificarRolAdministrador,
} from "../middleware/roles.js";
import {
  validarBodyCliente,
  validarBodyEditPerfil,
} from "../validaciones/validarBodyCliente.js";
import validarAsegurador from "../validaciones/validarAsegurador.js";
import validarAseguradorCorrecto from "../validaciones/validarAseguradorCorrecto.js";
import validarDuenio from "../validaciones/validarDuenio.js";

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
const MSG_CHECK_EMAIL = "Revise su correo electronico. :";
const MSG_ERROR_INVALID_PERMISSIONS =
  "No tienes permiso para realizar esta accion.";
const MSG_ERROR_DIFFERENT_PASSWORDS = "Las contraseñas no son iguales.";
const MSG_SUCCESSFUL_CHANGE = "Contraseña cambiada con exito.";

//no se donde se usa esto. verificar.
// yo lo uso
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

usersRouter.get("/getDatosPerfil", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await getUserById(_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const userMapped = {
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      dni: user.dni,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      address: user.domicile.address,
      number: user.domicile.number,
      floor: user.domicile.floor,
      apartment: user.domicile.apartment,
      zip_code: user.domicile.zip_code,
    };
    res.status(200).send(userMapped);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRouter.put("/editarPerfil", auth, async (req, res) => {
  try {
    console.log(req.body);
    const { phone, address, zip_code, number, apartment, floor } = req.body;
    const validationError = validarBodyEditPerfil({
      phone,
      address,
      zip_code,
      number,
      apartment,
      floor,
    });
    if (validationError) {
      return res.status(422).send(validationError);
    }
    const userMapper = {
      phone,
      address,
      zip_code,
      number,
      apartment,
      floor,
    };

    const result = await updatePerfil(req.user._id, userMapper);
    console.log(result);
    if (!result) {
      return res
        .status(404)
        .send({ error: "No se ha modificado ningun parametro del perfil." });
    }

    res.status(200).send(result);
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
      const { newState } = req.body;

      const clienteExiste = await getUserById(idAsegurado);
      if (!clienteExiste) {
        return res.status(404).send({ error: "El Cliente no existe." });
      }

      if (!validarAseguradorCorrecto(req, clienteExiste.asegurador)) {
        return res.status(404).send({ error: MSG_ERROR_401 });
      }

      const result = await changeState(clienteExiste, newState);
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

usersRouter.get(
  "/getAseguradores",
  auth,
  verificarRolAdministrador,
  async (req, res) => {
    try {
      const { search, dni, email, state } = req.query;
      const aseguradores = await getAseguradores(search, dni, email, state);
      res.status(200).send(aseguradores);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

usersRouter.put(
  "/editarEstadoAsegurador/:id",
  auth,
  verificarRolAdministrador,
  async (req, res) => {
    try {
      const idAsegurador = req.params.id;
      const { newState } = req.body;

      const aseguradorExiste = await getUserById(idAsegurador);
      if (!aseguradorExiste) {
        return res.status(404).send({ error: "El usuario no existe." });
      }
      if (aseguradorExiste.role !== "asegurador") {
        return res.status(404).send({
          error: "El usuario al que intento acceder no es asegurador",
        });
      }

      const result = await changeState(aseguradorExiste, newState);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

usersRouter.post("/resetPassword/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await mailExist(email);

    const token = await generateTokenResetPass(user);
    const resetLink = `http://localhost:3000/recuperarContrasenia?token=${token}`;

    //TODO
    //enviar el mail con el link para resetear la password

    res.status(200).send({ message: `${MSG_CHECK_EMAIL} ${resetLink}` });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
});

usersRouter.post("/changePassword/:token", auth, async (req, res) => {
  const user = await getUserByToken(req.params.token);
  const { _id } = user;
  const id = _id.toString();

  const { oldPass, newPass, confirmPassword } = req.body;

  try {
    if (!validarDuenio(id, req)) {
      return res.status(403).json({ error: MSG_ERROR_INVALID_PERMISSIONS });
    }

    if (newPass !== confirmPassword) {
      throw new Error(MSG_ERROR_DIFFERENT_PASSWORDS);
    }

    if (!(await validateOldPassword(id, oldPass, newPass))) {
      throw new Error("Contaseña antigua incorrecta.");
    }

    await changePassword(newPass, id);

    res.status(200).send({ message: MSG_SUCCESSFUL_CHANGE });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default usersRouter;
