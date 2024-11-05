import validator from 'validator';

const fieldNames = {
    dni: "dni", 
    aseguradora: "aseguradora", 
    primaSegura: "primaSegura", 
    deducible: "deducible",
    tipoCobertura: "tipoCobertura", 
    dominio: "dominio", 
    marca: "marca", 
    modelo: "modelo", 
    anio: "anio", 
    color: "color", 
    tipoVehiculo: "tipoVehiculo", 
    numeroIdentificador: "numeroIdentificador" }
  
  function validarBodyPoliza(body) {
    const errors = [];
  
    // validar campos obligatorios
    const requiredFields = ['dni', 'aseguradora', 'primaSegura', 'deducible', 'tipoCobertura', 'dominio', 'marca', "modelo", "anio", "color", "tipoVehiculo", "numeroIdentificador"];
    requiredFields.forEach(field => {
      if (!body[field] || body[field].toString().trim() === '') {
        errors.push(`${fieldNames[field]} es obligatorio.`);
      }
    });
     
    //validar dni
    if (body.dni && !/^\d{7,8}$/.test(body.dni)) {
      errors.push("El DNI debe tener entre 7 y 8 dígitos.");
    }
    
    //validar campos numéricos
    const numericFields = ['primaSegura', 'deducible', 'anio'];
    numericFields.forEach(field => {
      if (body.domicile && body.domicile[field] && !validator.isNumeric(body.domicile[field].toString())) {
        errors.push(`${fieldNames[field]} en domicilio debe ser un número.`);
      }
    });
  
    return errors.length > 0 ? errors.join(' ') : null;
  }  

export default validarBodyPoliza