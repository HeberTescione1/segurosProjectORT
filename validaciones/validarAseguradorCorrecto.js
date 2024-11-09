import jwt from "jsonwebtoken";

const validarAseguradorCorrecto = (req, asegurador) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];   

try {
    const decoded = jwt.verify(token, process.env.CLAVE_SECRETA);
    if (decoded._id === asegurador.toString()) {
      return true; 
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default validarAseguradorCorrecto ;