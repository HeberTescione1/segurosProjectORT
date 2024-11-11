import validator from "validator";
import bcryptjs from "bcryptjs";
import {esquemaSolicitud } from "./esquemas.js";
import { findByCredential, getUserById } from "../data/user.js";

export function validarContrasena(contrasena) {
  const mayuscula = /[A-Z]/.test(contrasena);
  const numero = /[0-9]/.test(contrasena);
  const caracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(contrasena);
  const largo = contrasena.length >= 8;

  return mayuscula && numero && caracterEspecial && largo;
}

function validarDNI(dni) {
  const numerico = validator.isNumeric(dni);
  const largo = dni.length >= 7 && dni.length <= 8;

  return numerico && largo;
}

export function validarBody(body) {
  return validarBodySinPassword(body) && body.password;
}

export function validarBodySinPassword(body) {
  return body.email && body.name && body.lastname;
}

export function validarBodyRegistro(body) {
  const email = body.email || "";
  const name = body.name || "";
  const lastname = body.lastname || "";
  const password = body.password || "";
  const dni = body.dni || "";
  let res = "";
  if (
    validator.isEmpty(email) ||
    validator.isEmpty(name) ||
    validator.isEmpty(lastname) ||
    validator.isEmpty(password) ||
    validator.isEmpty(dni)
  ) {
    throw new Error(
      "Faltan campos obligatorios: se requieren nombre, apellido, contraseña, email y dni."
    );
  }

  if (!validator.isEmail(body.email)) {
    res +=
      "Formato de email inválido: El email debe seguir el siguiente patron 'usuario@mail.com'\n";
  }
  if (!validarContrasena(body.password)) {
    res +=
      "Formato erróneo de contraseña: La misma debe contener un número, una mayúscula, un caracter especial y debe ser de al menos 8 caracteres.\n";
  }
  if (!validarDNI(body.dni)) {
    res +=
      "Formato erróneo de DNI: El mismo debe ser númerico de al menos 7 dígitos y no más de 8 dígitos.\n";
  }
  return res;
}



const validarSolicitud = (req, res, next) => {
    const { error } = esquemaSolicitud.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };

  
  export default validarSolicitud

export const validateOldPassword = async (id, oldPass, newPass) =>{ 
  const user = await getUserById(id)
  console.log(oldPass);
  
  const isMatch = await bcryptjs.compare(oldPass, user.password)
  return isMatch
}

