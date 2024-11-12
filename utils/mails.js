import axios from "axios";

export function sendEmailToExternalAPI(emailData) {
  axios
    .post("http://localhost:3002/api/emails/sendEmail", emailData)
    .then((response) => {
      console.log("Email enviado exitosamente", response.data);
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error.message);
    });
}
