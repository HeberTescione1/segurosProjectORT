import { getUserById } from "../data/user.js";
import { sendEmailToExternalAPI } from "./mails.js";


export async function enviarLinkRecuperacion(idAsegurado, resetLink) {
    const asegurado = await getUserById(idAsegurado);

    const emailRecuperacionContrasenia = {
        to: asegurado.email,
        subject: "Recuperacion de contraseña",
        template: "recuperarContrasenia",
        params: {
          aseguradoName: `${asegurado.lastname}, ${asegurado.name}`,
          linkRecuperacion: resetLink,
        },
      };

      sendEmailToExternalAPI(emailRecuperacionContrasenia)
}