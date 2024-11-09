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
  phone: `El teléfono ${added}`,
  apartment: `El departamento ${added}`,
};

function validarBodyCliente(body) {
  const errors = [];

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

  if (body.gender) {
    const validGenders = ["HOMBRE", "MUJER", "NO BINARIO"];
    if (!validGenders.includes(capitalizedGender)) {
      errors.push(
        `${fieldNames["gender"]} debe ser uno de los siguientes: Masculino, Femenino, No binario.`
      );
    }
  }

  const requiredDomicileFields = ["address", "number", "zip_code"];
  requiredDomicileFields.forEach((field) => {
    if (!body || !body[field] || body[field].toString().trim() === "") {
      errors.push(`${fieldNames[field]} en domicilio es obligatorio.`);
    }
  });

  if (body.email && !validator.isEmail(body.email)) {
    errors.push("El correo electrónico del asegurado no es válido.");
  }

  if (body.dni && !/^\d{7,8}$/.test(body.dni)) {
    errors.push("El DNI debe tener entre 7 y 8 dígitos.");
  }

  const numericFields = ["number", "zip_code", "phone", "dni"];
  numericFields.forEach((field) => {
    if (body[field] && !validator.isNumeric(body[field].toString())) {
      errors.push(`${fieldNames[field]} debe ser numérico.`);
    }
    if (body[field] && parseInt(body[field]) <= 0) {
      errors.push(`${fieldNames[field]} no puede ser negativo.`);
    }
  });

  if (body.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(body.date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    const day = today.getDate() - birthDate.getDate();

    const MIN_AGE = 18;
    if (birthDate > today) {
      errors.push("La fecha de nacimiento no puede ser futura.");
    } else if (
      age < MIN_AGE ||
      (age === MIN_AGE && (month < 0 || (month === 0 && day < 0)))
    ) {
      errors.push(`Debe ser mayor de ${MIN_AGE} años.`);
    }
  }

  if (body.phone) {
    if (!validator.isNumeric(body.phone.toString())) {
      errors.push("El teléfono debe contener solo números.");
    } else if (body.phone.length < 7 || body.phone.length > 12) {
      errors.push("El teléfono debe tener entre 7 y 12 dígitos.");
    }
    if (parseInt(body.phone) <= 0) {
      errors.push("El teléfono no puede ser negativo ni 0.");
    }
  }

  if (body.apartment) {
    if (!validator.isAlphanumeric(body.apartment.toString())) {
      errors.push("El departamento solo puede contener letras y números.");
    } else if (body.apartment.length > 6) {
      errors.push("El departamento no puede tener más de 6 caracteres.");
    }
  }

  if (body.zip_code) {
    if (body.zip_code.length !== 4) {
      errors.push("El código postal debe tener exactamente 4 dígitos.");
    }
    if (parseInt(body.zip_code) <= 0) {
      errors.push("El código postal no puede ser negativo ni 0.");
    }
  }

  if (body.address && !/^[a-zA-Z0-9.,'\s]*$/.test(body.address)) {
    errors.push(
      "La calle solo puede contener letras, números y los caracteres . , '"
    );
  }

  const MAX_FLOOR = 200;
  if (body.floor) {
    if (parseInt(body.floor) > MAX_FLOOR) {
      errors.push(`El piso no puede ser mayor a ${MAX_FLOOR}.`);
    }
    if (parseInt(body.floor) < 0) {
      errors.push("El piso no puede ser negativo.");
    }
  }

  return errors.length > 0 ? errors.join("\n") : null;
}

function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default validarBodyCliente;
