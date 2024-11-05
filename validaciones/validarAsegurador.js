import jwt from "jsonwebtoken";

const validarAsegurador = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];   

try {
    const decoded = jwt.verify(token, process.env.CLAVE_SECRETA); // Reemplaza 'yourSecretKey' con tu clave secreta
    if (decoded.role === "asegurador") {
      return decoded._id; // Devuelve el ID del asegurador
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default validarAsegurador ;