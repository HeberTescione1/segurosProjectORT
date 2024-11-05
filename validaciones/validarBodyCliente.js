import validator from 'validator';

const fieldNames = {
    name: "nombre",
    lastname: "apellido",
    email: "correo electrónico",
    dni: "DNI",
    cuit: "CUIT",
    date_of_birth: "fecha de nacimiento",
    gender: "género",
    address: "calle",
    number: "número",
    zip_code: "código postal",
    floor: "piso",
  };
  
  function validarBodyCliente(body) {
    const errors = [];
  
    // Campos obligatorios
    const requiredFields = ['name', 'lastname', 'email', 'dni', 'cuit', 'date_of_birth', 'gender'];
    requiredFields.forEach(field => {
      if (!body[field] || body[field].toString().trim() === '') {
        errors.push(`${fieldNames[field]} es obligatorio.`);
      }
    });
  
    // Campos obligatorios dentro de domicilio
    const requiredDomicileFields = ['address', 'number', 'zip_code'];
    requiredDomicileFields.forEach(field => {
      if (!body || !body[field] || body[field].toString().trim() === '') {
        errors.push(`${fieldNames[field]} en domicilio es obligatorio.`);
      }
    });
  
    // Validar formato de email
    if (body.email && !validator.isEmail(body.email)) {
      errors.push("El correo electrónico no es válido.");
    }
  
    // Validar DNI (7-8 dígitos)
    if (body.dni && !/^\d{7,8}$/.test(body.dni)) {
      errors.push("El DNI debe tener entre 7 y 8 dígitos.");
    }
  
    // Validar CUIT (11 dígitos y algoritmo de validación)
    if (body.cuit && !isValidCUIT(body.cuit)) {
      errors.push("El CUIT no es válido.");
    }
  
    // Validar campos numéricos
    const numericFields = ['number', 'floor', 'zip_code'];
    numericFields.forEach(field => {
      if (body.domicile && body.domicile[field] && !validator.isNumeric(body.domicile[field].toString())) {
        errors.push(`${fieldNames[field]} en domicilio debe ser un número.`);
      }
    });
  
    return errors.length > 0 ? errors.join(' ') : null;
  }
  
  function isValidCUIT(cuit) {
    if (!/^\d{11}$/.test(cuit)) return false;
  
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const digits = cuit.split('').map(Number);
    const checkDigit = digits.pop();
  
    const sum = digits.reduce((acc, digit, index) => acc + digit * multipliers[index], 0);
    const mod11 = 11 - (sum % 11);
  
    return mod11 === checkDigit || (mod11 === 11 && checkDigit === 0);
  }
  

export default validarBodyCliente