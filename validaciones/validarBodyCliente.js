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
  const numericFields = ["number", "floor", "zip_code"];
  numericFields.forEach((field) => {
    if (
      body.domicile &&
      body.domicile[field] &&
      !validator.isNumeric(body.domicile[field].toString())
    ) {
      errors.push(`${fieldNames[field]} en domicilio debe ser un número.`);
    }
  });

  return errors.length > 0 ? errors.join(" ") : null;
}

export default validarBodyCliente;
