import express from "express";
const resetPasswordRouter = express.Router();
import jwt from "jsonwebtoken";
import { changePassword } from "../data/user.js";

resetPasswordRouter.post("/:token", async (req, res) => {
    const token = req.params.token

    
    const {newPass, newPass2} = req.body

    const info = jwt.decode(token);
    
    const {_id} = info

    try {
        if(newPass !== newPass2){
            throw new Error("Las contraseñas no son iguales.")
        }

        //const result = 
        await changePassword(newPass , _id)

    } catch (error) {
        res.status(400).send(error.message)
    }

})


export default resetPasswordRouter