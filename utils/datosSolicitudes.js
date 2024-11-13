export function getDatosDelSiniestro(solicitud) {
  return {
    fecha: solicitud.datosSiniestro.fechaOcurrencia,
    hora: solicitud.datosSiniestro.horaOcurrencia,
    lugar: solicitud.datosSiniestro.lugarOcurrencia,
    cp: solicitud.datosSiniestro.codigoPostal,
    cantAutos: solicitud.datosSiniestro.cantidadAutosParticipantes,
  };
}

export function getInformacionAdicional(solicitud) {
  return {
    daniosPersonales: solicitud.datosSiniestro.hubieronDaniosPersonales,
    daniosMateriales: solicitud.datosSiniestro.hubieronDaniosMateriales,
    testigos: solicitud.datosSiniestro.hubieronTestigos,
    denuncia: solicitud.datosSiniestro.huboDenuncia,
  };
}

export function getDatosPropietarioVehiculoAsegurado(solicitud) {
  const datosPersona = solicitud.propietarioAsegurado.datosPersona;
  const domicilio = datosPersona.domicilio;
  let domicilioConcatenado = domicilio.address;
  if (domicilio.number) {
    domicilioConcatenado += ` ${domicilio.number}`;
  }
  if (domicilio.floor) {
    domicilioConcatenado += `, Piso ${domicilio.floor}`;
  }
  if (domicilio.departamento) {
    domicilioConcatenado += `, Depto ${domicilio.departamento}`;
  }
  const vehiculo = solicitud.propietarioAsegurado.vehiculo;
  const marcaModelo = `${vehiculo.datosVehiculo.marca}   ${vehiculo.datosVehiculo.modelo}`;

  return {
    nombre: datosPersona.nombreCompleto,
    domicilio: domicilioConcatenado,
    cp: domicilio.zip_code,
    dni: datosPersona.dni,
    email: datosPersona.email,
    telefono: datosPersona.telefono,
    marcaModelo: marcaModelo,
    color: vehiculo.datosVehiculo.color,
    anio: vehiculo.datosVehiculo.anio,
    dominio: vehiculo.datosVehiculo.dominio,
    uso: vehiculo.usoDelVehiculo,
  };
}

export function getDatosPropietarioDelOtroVehiculo(solicitud) {
  const datosPersona = solicitud.propietarioAfectado.datosPersona;
  const nombreCompleto = `${datosPersona.nombre} ${datosPersona.apellido}`;
  const domicilio = datosPersona.domicilio;
  let domicilioConcatenado = domicilio.address;
  if (domicilio.number) {
    domicilioConcatenado += ` ${domicilio.number}`;
  }
  if (domicilio.floor) {
    domicilioConcatenado += `, Piso ${domicilio.floor}`;
  }
  if (domicilio.departamento) {
    domicilioConcatenado += `, Depto ${domicilio.departamento}`;
  }
  const vehiculo = solicitud.propietarioAfectado.vehiculoPropietadoAfectado;
  const marcaModelo = `${vehiculo.datosVehiculo.marca}   ${vehiculo.datosVehiculo.modelo}`;
  return {
    nombre: nombreCompleto,
    domicilio: domicilioConcatenado,
    cp: domicilio.zip_code,
    dni: datosPersona.dni,
    email: datosPersona.email,
    telefono: datosPersona.telefono,
    marcaModelo: marcaModelo,
    color: vehiculo.datosVehiculo.color,
    anio: vehiculo.datosVehiculo.anio,
    dominio: vehiculo.datosVehiculo.dominio,
    aseguradora: vehiculo.aseguradora,
    poliza: vehiculo.poliza,
    fechaVencimiento: solicitud.propietarioAfectado.fechaVencimientoPoliza,
  };
}

export function getDatosConductorAsegurado(solicitud) {
  const conductor = solicitud.conductorAsegurado;
  const datosPersona = conductor.datosPersona;
  const domicilio = datosPersona.domicilio;
  let domicilioConcatenado = domicilio.address;
  if (domicilio.number) {
    domicilioConcatenado += ` ${domicilio.number}`;
  }
  if (domicilio.floor) {
    domicilioConcatenado += `, Piso ${domicilio.floor}`;
  }
  if (domicilio.departamento) {
    domicilioConcatenado += `, Depto ${domicilio.departamento}`;
  }
  return {
    nombre: datosPersona.nombreCompleto,
    domicilio: domicilioConcatenado,
    cp: domicilio.zip_code,
    dni: datosPersona.dni,
    fechaNacimiento: datosPersona.fechaDeNacimiento,
    telefono: datosPersona.telefono,
    sexo: datosPersona.sexo,
    email: datosPersona.email,
    nroRegistro: conductor.nroRegistro,
    clase: conductor.claseRegistro,
    fechaExp: conductor.fechaRegistroExpedicion,
    fechaVen: conductor.fechaRegistroVencimiento,
    relacion: conductor.relacionAsegurado,
  };
}

export function getDatosConductorDelOtroVehiculo(solicitud) {
  const conductor = solicitud.conductorAfectado;
  const datosPersona = conductor.datosPersona;
  const domicilio = datosPersona.domicilio;
  let domicilioConcatenado = domicilio.address;
  if (domicilio.number) {
    domicilioConcatenado += ` ${domicilio.number}`;
  }
  if (domicilio.floor) {
    domicilioConcatenado += `, Piso ${domicilio.floor}`;
  }
  if (domicilio.departamento) {
    domicilioConcatenado += `, Depto ${domicilio.departamento}`;
  }
  return {
    nombre: datosPersona.nombreCompleto,
    domicilio: domicilioConcatenado,
    cp: domicilio.zip_code,
    dni: datosPersona.dni,
    fechaNacimiento: datosPersona.fechaDeNacimiento,
    telefono: datosPersona.telefono,
    sexo: datosPersona.sexo,
    email: datosPersona.email,
    nroRegistro: conductor.nroRegistro,
    clase: conductor.claseRegistro,
    fechaExp: conductor.fechaRegistroExpedicion,
    fechaVen: conductor.fechaRegistroVencimiento,
    relacion: conductor.relacionAsegurado,
  };
}

export function getDatosAdicionales(solicitud) {
  const siniestro = solicitud.datosSiniestro;
  return {
    tipoCamino: siniestro.tipoCamino,
    estadoTiempo: siniestro.estadoTiempo,
    grua: siniestro.asistioGrua,
    ambulancia: siniestro.asistioAmbulancia,
    bomberos: siniestro.asistioBomberos,
    observaciones: siniestro.observaciones,
  };
}

export function getConsecuenciasDelSiniestro(solicitud) {
  const consecuencias = solicitud.datosSiniestro.consecuenciaSiniestro;
  return {
    danioParcial: consecuencias.danioParcial,
    danioTerceros: consecuencias.danioTerceros,
    destruccionTotal: consecuencias.destruccionTotal,
    incendioParcial: consecuencias.incendioParcial,
    incendioTotal: consecuencias.incendioTotal,
    otros: consecuencias.otros,
    roboParcial: consecuencias.roboParcial,
    roboRueda: consecuencias.roboRueda,
    roboTotal: consecuencias.roboTotal,
    roturaCristales: consecuencias.roturaCristales,
  };
}

export function getLugarAsistencia(solicitud) {
  let res = null;
  const lugarAsistencia = solicitud.datosSiniestro.lugarAsistencia;
  if (lugarAsistencia) {
    res = {
      nombreCentro: lugarAsistencia.nombreCentro,
      internado: lugarAsistencia.quedaInternado,
      estadoLesiones: lugarAsistencia.estadoLesiones,
      descripcionLesiones: lugarAsistencia.descripcionLesiones,
    };
  }
  return res;
}
