import express from "express";

const testRouter = express.Router();

testRouter.get("/getStatus", async (req, res) => {
  res.status(200).send(true);
});
export default testRouter;