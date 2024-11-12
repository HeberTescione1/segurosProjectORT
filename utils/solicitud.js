import { getUserById } from "../data/user.js";
import { sendEmailToExternalAPI } from "./mails.js";

export async function enviarNotificacionesAPartes(idAsegurado, idAsegurador) {
  const asegurado = await getUserById(idAsegurado);
  const asegurador = await getUserById(idAsegurador);
  const emailDataAsegurado = {
    email: asegurado.email,
    subject: "Solicitud ingresada",
    template: "solicitudIngreso",
    params: {
      aseguradoName: `${asegurado.lastname}, ${asegurado.name}`
    },
  };
  const emailDataAsegurador = {
    email: asegurador.email,
    subject: "Nueva solicitud ingresada",
    template: "notificacionAsegurador",
    params: {
      aseguradoName: `${asegurado.lastname}, ${asegurado.name}`,
      aseguradorName: `${asegurador.lastname}, ${asegurador.name}`,
    },
  };

  sendEmailToExternalAPI(emailDataAsegurado);
  sendEmailToExternalAPI(emailDataAsegurador);
}
