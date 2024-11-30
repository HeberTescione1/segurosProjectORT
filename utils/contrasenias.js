import { getUserById } from "../data/user.js";
import { sendEmailToExternalAPI } from "./mails.js";


export async function enviarLinkRecuperacion(idUsuario, resetLink) {
    const usuario = await getUserById(idUsuario);

    const emailRecuperacionContrasenia = {
        to: usuario.email,
        subject: "Recuperacion de contraseña",
        template: "recuperarContrasenia",
        params: {
          usuarioName: `${usuario.lastname}, ${usuario.name}`,
          linkRecuperacion: resetLink,
        },
      };

      sendEmailToExternalAPI(emailRecuperacionContrasenia)
}