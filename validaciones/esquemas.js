import Joi from "joi";



export const esquemaDomicilio = Joi.object({
    calle: Joi.string().required(),
    localidad: Joi.string().required(),
    codigoPostal: Joi.number().required(),
    provincia: Joi.string().required(),
    pais: Joi.string().required()
})

const esquemaLugarAsistencia = Joi.object({
    nombreCentro: Joi.string().required(),
    quedaInternado: Joi.boolean().required(),
    descripcionLesiones: Joi.string().required(),
    estadoLesiones: Joi.string().valid('LEVE', 'GRAVE', 'MUY_GRAVE', 'MUERTE').required()
})

const esquemaVehiculo = Joi.object({
    numeroIdentificador: Joi.string().required(),
    marca: Joi.string().required(),
    modelo: Joi.string().required(),
    tipoVehiculo: Joi.string().valid('AUTO', 'MOTO', 'CAMION').required(),
    anio: Joi.number().integer().required(),
    dominio: Joi.string().required(),
    idAsegurado: Joi.number().integer().required(),
    color: Joi.string().required()
});

const esquemaVehiculoTercero = Joi.object({
    esquemaVehiculo: esquemaVehiculo,
    aseguradora: Joi.string().required(),
    poliza: Joi.string().required(),
    fechaVencimiento: Joi.date().required()
});

const esquemaPersona = Joi.object({
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    nombreCompleto: Joi.string().required(),
    cuit: Joi.string().required(),
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
    relacionAsegurado: Joi.string().required(),
    fechaExpedicion: Joi.date().required(),
    fechaVencimiento: Joi.date().required(),
})

const esquemaPropietarioAfectado = Joi.object({
    datosPersona: esquemaPersona.required(),
    vehiculoPropietadoAfectado: esquemaVehiculoTercero.required()
})

const esquemaLesiones = Joi.object({
    lesionado: esquemaPersona.required(),
    peatonOCiclista: Joi.boolean().required(),
    conductorTercero: Joi.boolean().required(),
    ocupanteTercero: Joi.boolean().required(),
    asegurado: Joi.boolean().required(),
    conductorAsegurado: Joi.boolean().required()
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
    consecuenciaSiniestro: Joi.string().valid(
        'DANIO_PARCIAL',
        'ROBO_RUEDA',
        'ROBO_PARCIAL',
        'DAÑO_TERCEROS',
        'INCENDIO_TOTAL',
        'OTROS',
        'DESTRUCCION_TOTAL',
        'ROBO_TOTAL',
        'ROTURA_CRISTALES',
        'INCENCIO_PARCIAL',
    ).required()
})

export const esquemaSolicitud = Joi.object({
    estado: Joi.string().valid('PENDIENTE', 'RECHAZADO', 'ACEPTADO').required(),
    daniosVehiculoAsegurado: Joi.string().required(),
    daniosVehiculoAfectado: Joi.string().required(),
    idPropietarioAsegurado: Joi.string().required(),
    conductorAsegurado: esquemaConductorAsegurado.required(),
    propietarioAfectado: esquemaPropietarioAfectado.required(),
    conductorAfectado: esquemaPersona.required(),
    lesiones: esquemaLesiones.required(),
    datosSiniestro: esquemaDatosSiniestro.required()
});