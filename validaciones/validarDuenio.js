import jwt from "jsonwebtoken";

const validarDuenio = (idAsegurado, req) => {
    const authHeader = req.headers['authorization'];    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return false;
    }

    try {
        const decoded = jwt.verify(token, process.env.CLAVE_SECRETA);        
        return decoded._id === idAsegurado;
    } catch (error) {
        return false;
    }
};

export default validarDuenio;
