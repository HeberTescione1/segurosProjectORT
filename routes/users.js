import express from "express";
import {
  addUser,
  findByCredential,
  generateAuthToken,
  /*  getUser,
  updateUser, */
  addClient,
  getClientsByAsegurador,
  deleteUser,
} from "../data/user.js";
import auth from "../middleware/auth.js";

const usersRouter = express.Router();
const MSG_ERROR_400 =
  "Faltan campos obligatorios: se requieren nombre, apellido, contraseña, email y dni.";
const MSG_ERROR_409 =
  "El dni o el mail ya se encuentra registrado en nuestra base de datos.";
const MSG_ERROR_401 = "No tiene permisos para realizar esta acción.";
const MSG_ERROR_LOGIN_VACIO =
  "Faltan campos obligatorios: se requieren email y contraseña.";
const ROLE_ASEGURADOR = "asegurador";
const ROLE_ASEGURADO = "asegurado";
const ROLE_ADMIN = "admin";

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

usersRouter.get("/clients", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ error: MSG_ERROR_401 });
    }

    const { search, dni, email } = req.query; // Obtener filtros desde query params

    // Obtener los clientes relacionados con el asegurador y aplicar filtros
    const clients = await getClientsByAsegurador(_id, { search, dni, email });

    res.status(200).send(clients);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

usersRouter.post("/register", async (req, res) => {
  try {
    if (!validarBodyRegistro(req.body)) {
      return res.status(400).send({ error: MSG_ERROR_400 });
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

usersRouter.post("/register/client", auth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== ROLE_ASEGURADOR) {
      return res.status(401).send({ MSG_ERROR_401 });
    }

    if (!validarBodySinPassword(req.body)) {
      return res.status(400).send({ error: MSG_ERROR_400 });
    }

    req.body.role = ROLE_ASEGURADO;
    req.body.password = req.body.dni;
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

usersRouter.post("/loginAdminYAsegurador", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        error: MSG_ERROR_LOGIN_VACIO,
      });
    }

    const user = await findByCredential(email, password);

    if (user.role !== ROLE_ASEGURADOR && user.role !== ROLE_ADMIN) {
      return res.status(403).send({
        error: "Acceso denegado. Solo para aseguradores o administradores.",
      });
    }
    const token = await generateAuthToken(user);
    res.status(200).send({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        error: MSG_ERROR_LOGIN_VACIO,
      });
    }
    const user = await findByCredential(email, password);
    const token = await generateAuthToken(user);
    res.status(200).send({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

/* usersRouter.put("/edit", auth, async (req, res) => {
  try {
    const result = await updateUser(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
}); */

/* usersRouter.get("/:id", auth, async (req, res) => {
  try {
    const result = await getUser(req.params.id);
    if (!result) {
      return res.status(404).send({ error: "El usuario no existe." });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
}); */

function validarBodyRegistro(body) {
  return validarBodySinPassword(body) && body.password;
}

function validarBodySinPassword(body) {
  return body.email && body.name && body.lastname;
}

export default usersRouter;
