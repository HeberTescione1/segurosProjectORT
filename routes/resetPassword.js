import express from "express";
const resetPasswordRouter = express.Router();
import jwt from "jsonwebtoken";
import { changePassword } from "../data/user.js";
import { authReset } from "../middleware/auth.js";

const MSG_ERROR_DIFFERENT_PASSWORDS = "Las contraseñas no son iguales."
const MSG_ERRROR_CHANGE_ERROR = "Error al cambiar la contraseña."
const MSG_SUCCESSFUL_CHANGE = "Contraseña cambiada con exito."

resetPasswordRouter.post("/:token", authReset, async (req, res) => {
    const token = req.params.token;
    const info = jwt.decode(token);
    const { newPass, confirmPassword } = req.body;
  
    
    const { _id } = info;
  
    try {
      if (newPass !== confirmPassword) {
        return res.status(400).json({ error: MSG_ERROR_DIFFERENT_PASSWORDS });
      }
  
      const result = await changePassword(newPass, _id);
      if (!result) {
        return res.status(400).json({ error: MSG_ERRROR_CHANGE_ERROR });
      }
  
      res.status(200).json({ message: MSG_SUCCESSFUL_CHANGE });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


export default resetPasswordRouter