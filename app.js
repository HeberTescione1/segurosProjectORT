import "dotenv/config";
import express from "express";
import  cors from "cors";
import usersRouter from "./routes/users.js";
import polizasRouter from "./routes/polizas.js";
import testRouter from "./routes/test.js";

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/polizas", polizasRouter);
app.use("/api/test", testRouter);

app.listen(PORT, () => {
  console.log("Servidor Web en el puerto:", PORT);
});

