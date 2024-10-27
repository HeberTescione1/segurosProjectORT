import Joi from "joi";



export const esquemaDomicilio = Joi.object({
    address: Joi.string().required(),
    locality: Joi.string().required(),
    zip_code: Joi.number().required(),
    province: Joi.string().required(),
    country: Joi.string().required()
})

const esquemaLugarAsistencia = Joi.object({
    nombreCentro: Joi.string().required(),
    quedaInternado: Joi.boolean().required(),
    descripcionLesiones: Joi.string().required(),
    estadoLesiones: Joi.string().valid('LEVE', 'GRAVE', 'MUY_GRAVE', 'MUERTE').required()
})

const esquemaVehiculo = Joi.object({
    marca: Joi.string().required(),
    modelo: Joi.string().required(),
    tipoVehiculo: Joi.string().valid('AUTO', 'MOTO', 'CAMION').required(),
    color: Joi.string().required(),
    anio: Joi.number().integer().required(),
    dominio: Joi.string().required()
});

const esquemaVehiculoTercero = Joi.object({
    datosVehiculo: esquemaVehiculo,
    aseguradora: Joi.string().required(),
    poliza: Joi.string().required()
});

const esquemaPersona = Joi.object({
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    nombreCompleto: Joi.string().required(),
    cuit: Joi.number().required(),
    email: Joi.string().email().required(),
    telefono: Joi.number().integer().required(),
    fechaDeNacimiento: Joi.date().required(),
    sexo: Joi.string().required(),
    domicilio: esquemaDomicilio.required()
});

const esquemaConductorAsegurado = Joi.object({
    datosPersona: esquemaPersona.required(),
    nroRegistro: Joi.string().required(),
    claseRegistro: Joi.string().required(),
    fechaRegistroExpedicion: Joi.date().required(),
    fechaRegistroVencimiento: Joi.date().required(),
    relacionAsegurado: Joi.string().required(),
})

const esquemaPropietarioAfectado = Joi.object({
    datosPersona: esquemaPersona.required(),
    vehiculoPropietadoAfectado: esquemaVehiculoTercero.required(),
    fechaVencimientoPoliza: Joi.date().required()
})

const esquemaLesionado = Joi.object({
    datosPersona : esquemaPersona.required(),
    estadoCivil: Joi.string().required(),
    telefonoAlternativo: Joi.number().required()
})

const esquemaLesiones = Joi.object({
    lesionado: esquemaLesionado.required(),
    peatonOCiclista: Joi.boolean().required(),
    conductorTercero: Joi.boolean().required(),
    ocupanteTercero: Joi.boolean().required(),

    conductorAsegurado: Joi.boolean().required(),
    asegurado: Joi.boolean().required(),
    conductor: Joi.boolean().required(),
    propietarioVehiculoAsegurado: Joi.boolean().required(),
    relacionConPropietario: Joi.boolean().required() 
    
})

const esquemaConsecuenciaSiniestro = Joi.object({
    danioParcial: Joi.boolean().required(),
    roboRueda: Joi.boolean().required(),
    roboParcial: Joi.boolean().required(),
    danioTerceros: Joi.boolean().required(),
    incendioTotal: Joi.boolean().required(),
    otros: Joi.boolean().required(),
    destruccionTotal: Joi.boolean().required(),
    roboTotal: Joi.boolean().required(),
    roturaCristales: Joi.boolean().required(),
    incendioParcial: Joi.boolean().required(),
})

const esquemaDatosSiniestro = Joi.object({
    lugarAsistencia: esquemaLugarAsistencia,
    fechaOcurrencia: Joi.date().required(),
    horaOcurrencia: Joi.string().required(),
    lugarOcurrencia: Joi.string().required(),
    codigoPostal: Joi.number().required(),
    localidad: Joi.string().required(),
    provincia: Joi.string().required(),
    pais: Joi.string().required(),
    cantidadAutosParticipantes: Joi.number().required(),
    interseccion: Joi.string().required(),
    hubieronDaniosPersonales: Joi.boolean().required(),
    hubieronDaniosMateriales: Joi.boolean().required(),
    hubieronTestigos: Joi.boolean().required(),
    vigencia: Joi.string().required(),
    cobertura: Joi.string().required(),
    franquicia: Joi.string().required(),
    cobranza: Joi.string().required(),
    asistioGrua: Joi.boolean().required(),
    asistioAmbulancia: Joi.boolean().required(),
    asistioBomberos: Joi.boolean().required(),
    huboDenuncia: Joi.string().valid('SI', 'COMISARIA', 'ACTA','NO').required(),
    estadoTiempo: Joi.string().valid('SECO', 'LLUVIA', 'NIEBLA', ' GRANIZO', 'NIEVE').required(),
    estadoCamino: Joi.string().valid('BUENO', 'MALO', 'REGULAR').required(),
    tipoCamino: Joi.string().valid('ASFALTO', 'EMPEDRADO', 'RIPIO', 'TIERRA').required(),
    consecuenciaSiniestro: esquemaConsecuenciaSiniestro.required(),
    observaciones: Joi.string().required(),
    relato: Joi.string().required()
})

const esquemaConductorAfectado = Joi.object({
    datosPersona: esquemaPersona.required(),
    nroRegistro: Joi.string().required(),
    claseRegistro: Joi.string().required(),
    fechaRegistroExpedicion: Joi.date().required(),
    fechaRegistroVencimiento: Joi.date().required(),
    relacionAsegurado: Joi.string().required(),
})

const esquemaVehiculoPropietario = Joi.object({
    datosVehiculo: esquemaVehiculo.required(),
    usoDelVehiculo: Joi.string().valid('PARTICULAR', 'COMERCIAL')
})

const esquemaPropietarioAsegurado = Joi.object({
    datosPersona: esquemaPersona.required(),
    vehiculo: esquemaVehiculoPropietario.required()
})

export const esquemaSolicitud = Joi.object({
    estado: Joi.string().valid('PENDIENTE', 'RECHAZADO', 'ACEPTADO').required(),
    daniosVehiculoAsegurado: Joi.string().required(),
    daniosVehiculoAfectado: Joi.string().required(),
    idAsegurado: Joi.string().required(),
    idAsegurador: Joi.string().required(),
    conductorAsegurado: esquemaConductorAsegurado.required(),
    propietarioAfectado: esquemaPropietarioAfectado.required(),
    conductorAfectado: esquemaConductorAfectado.required(),
    propietarioAsegurado: esquemaPropietarioAsegurado.required(),
    lesiones: esquemaLesiones.required(),
    datosSiniestro: esquemaDatosSiniestro.required()
});