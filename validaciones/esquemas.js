import Joi from "joi";

export const esquemaSolicitud = Joi.object({
    estado: Joi.string().required(),
    daniosVehiculoAsegurado: Joi.string().required(),
    daniosVehiculoAfectado: Joi.string().required(),
    propietarioAsegurado: Joi.string().required(),
    conductorAsegurado: Joi.object({
        nombre: Joi.string().required(),
        apellido: Joi.string().required(),
        nombreCompleto: Joi.string().required(),
        cuit: Joi.string().required(),
        email: Joi.string().email().required(),
        telefono: Joi.number().required(),
        fechaNacimiento: Joi.date().required(),
        sexo: Joi.string().required(),
        nroRegistro: Joi.string().required(),
        claseRegistro: Joi.string().required(),
        relacion: Joi.string().required(),
        fechaExpedicion: Joi.date().required(),
        fechaVencimiento: Joi.date().required()
    }).required(),
    propietarioAfectado: Joi.object({
        nombre: Joi.string().required(),
        apellido: Joi.string().required(),
        nombreCompleto: Joi.string().required(),
        cuit: Joi.string().required(),
        email: Joi.string().email().required(),
        telefono: Joi.number().required(),
        fechaNacimiento: Joi.date().required(),
        sexo: Joi.string().required()
    }).required(),
    conductorAfectado: Joi.object({
        nombre: Joi.string().required(),
        apellido: Joi.string().required(),
        nombreCompleto: Joi.string().required(),
        cuit: Joi.string().required(),
        email: Joi.string().email().required(),
        telefono: Joi.number().required(),
        fechaNacimiento: Joi.date().required(),
        sexo: Joi.string().required()
    }).required(),
    lesiones: Joi.object({
        lesionado: Joi.object({
            nombre: Joi.string().required(),
            apellido: Joi.string().required(),
            nombreCompleto: Joi.string().required(),
            cuit: Joi.string().required(),
            email: Joi.string().email().required(),
            telefono: Joi.number().required(),
            fechaNacimiento: Joi.date().required(),
            sexo: Joi.string().required()
        }).required(),
        peatonOCiclista: Joi.boolean().required(),
        conductorTercero: Joi.boolean().required(),
        ocupanteTercero: Joi.boolean().required(),
        asegurado: Joi.boolean().required(),
        conductorAsegurado: Joi.boolean().required()
    }).required(),
    datosSiniestro: Joi.object({
        huboDenuncia: Joi.string().required(),
        estadoTiempo: Joi.string().required(),
        estadoCamino: Joi.string().required(),
        tipoCamino: Joi.string().required(),
        consecuenciaSiniestro: Joi.string().required(),
        lugarAsistencia: Joi.number().required(),
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
        asistioBomberos: Joi.boolean().required()
    }).required()
});
