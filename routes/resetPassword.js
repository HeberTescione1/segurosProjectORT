import express from "express";
const resetPasswordRouter = express.Router();
import jwt from "jsonwebtoken";
import { changePassword } from "../data/user.js";
import { authReset } from "../middleware/auth.js";

const MSG_ERROR_DIFFERENT_PASSWORDS = "Las contraseñas no son iguales."
const MSG_ERRROR_CHANGE_ERROR = "Error al cambiar la contraseña."
const MSG_SUCCESSFUL_CHANGE = "Contraseña cambiada con exito."

resetPasswordRouter.post("/:token", authReset ,async (req, res) => {
    const token = req.params.token
    const {newPass, confirmPassword} = req.body

    const info = jwt.decode(token);
    const {_id} = info
    try {
        if(newPass !== confirmPassword){
            throw new Error(MSG_ERROR_DIFFERENT_PASSWORDS)
        }

        const result = await changePassword(newPass , _id)
        if (!result) {
            throw new Error(MSG_ERRROR_CHANGE_ERROR)
        }
        res.status(200).send({message: MSG_SUCCESSFUL_CHANGE})
    } catch (error) {
        res.status(400).send(error.message)
    }
})


export default resetPasswordRouter