import axios from "axios";

export function sendEmailToExternalAPI(emailData) {
  const token = process.env.TOKEN_EMAIL;
  axios
    .post(process.env.API_SEND_EMAIL, emailData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Email enviado exitosamente", response.data);
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error.message);
    });
}
