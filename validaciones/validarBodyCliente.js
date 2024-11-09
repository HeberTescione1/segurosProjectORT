import validator from "validator";
const added = "del asegurado";
const fieldNames = {
  name: `El nombre ${added}`,
  lastname: `El apellido ${added}`,
  email: `El correo electrónico ${added}`,
  dni: `El DNI ${added}`,
  date_of_birth: `La fecha de nacimiento ${added}`,
  gender: `El género ${added}`,
  address: `La calle ${added}`,
  number: `El número de la dirección ${added}`,
  zip_code: `El código postal ${added}`,
  floor: `El piso ${added}`,
};

function validarBodyCliente(body) {
  const errors = [];

  // Campos obligatorios
  const requiredFields = [
    "name",
    "lastname",
    "email",
    "dni",
    "date_of_birth",
    "gender",
  ];
  requiredFields.forEach((field) => {
    if (!body[field] || body[field].toString().trim() === "") {
      errors.push(`${fieldNames[field]} es obligatorio.`);
    }
  });

  // Campos obligatorios dentro de domicilio
  const requiredDomicileFields = ["address", "number", "zip_code"];
  requiredDomicileFields.forEach((field) => {
    if (!body || !body[field] || body[field].toString().trim() === "") {
      errors.push(`${fieldNames[field]} en domicilio es obligatorio.`);
    }
  });

  // Validar formato de email
  if (body.email && !validator.isEmail(body.email)) {
    errors.push("El correo electrónico del asegurado no es válido.");
  }

  // Validar DNI (7-8 dígitos)
  if (body.dni && !/^\d{7,8}$/.test(body.dni)) {
    errors.push("El DNI debe tener al menos 7 y 8 dígitos máximo.");
  }

  // Validar campos numéricos
  const numericFields = ["number", "floor", "zip_code", "phone", "dni"];
  numericFields.forEach((field) => {
    if (body[field] && !validator.isNumeric(body[field].toString())) {
      errors.push(`${fieldNames[field]} debe ser numérico.`);
    }
  });

  //validacion de edad mayor a 18 a;os
  if (body.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(body.date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    const day = today.getDate() - birthDate.getDate();

    const MAX_AGE = 18;
    if (birthDate > today) {
      errors.push("La fecha de nacimiento no puede ser futura.");
    } else if (
      age < MAX_AGE ||
      (age === MAX_AGE && (month < 0 || (month === 0 && day < 0)))
    ) {
      errors.push(`Debe ser mayor de ${MAX_AGE} años.`);
    }
  }

  //validar numero de telefono
  if (body.phone && !validator.isNumeric(body.phone.toString())) {
    errors.push("El teléfono debe contener solo números.");
  } else if (body.phone && (body.phone.length < 7 || body.phone.length > 12)) {
    errors.push("El teléfono debe tener entre 7 y 12 dígitos.");
  }

  //validar departamento
  if (body.apartment && !validator.isAlphanumeric(body.apartment.toString())) {
    errors.push("El departamento solo puede contener letras y números.");
  } else if (body.apartment && body.apartment.length > 6) {
    errors.push("El departamento no puede tener más de 6 caracteres.");
  }

  //validar codigo postal 4 digitos
  if (body.zip_code && body.zip_code.length !== 4) {
    errors.push("El código postal debe tener exactamente 4 dígitos.");
  }

  //validar calle
  if (body.address && !/^[a-zA-Z0-9.,'\s]*$/.test(body.address)) {
    errors.push(
      "La calle solo puede contener letras, números y los caracteres . , '"
    );
  }
  //validar piso si es mayor de 200
  const MAX_FLOOR = 200;
  if (body.floor && parseInt(body.floor) > MAX_FLOOR) {
    errors.push(`El piso no puede ser mayor a ${MAX_FLOOR}.`);
  }

  return errors.length > 0 ? errors.join("\n") : null;
}

export default validarBodyCliente;
