import express from "express";
import jwt from "jsonwebtoken";
const testRouter = express.Router();

testRouter.get("/getStatus", async (req, res) => {
  res.status(200).send(true);
});

testRouter.post("/validateToken", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, process.env.CLAVE_SECRETA, (err) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ valid: false });
    }
    res.json({ valid: true });
  });
});
export default testRouter;
