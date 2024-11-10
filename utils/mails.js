import axios from "axios";

export function sendEmailToExternalAPI(emailData) {
  axios.post("http://localhost:3002/api/emails/sendEmail", emailData);
}
