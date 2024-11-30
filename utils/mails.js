import axios from "axios";

export function sendEmailToExternalAPI(emailData) {
  axios
    .post(process.env.API_SEND_EMAIL, emailData)
    .then((response) => {
      console.log("Email enviado exitosamente", response.data);
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error.message);
    });
}
