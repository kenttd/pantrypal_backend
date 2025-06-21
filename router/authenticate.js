import express from "express";
import jwt from "jsonwebtoken";
import knex from "../knex.js";
const authRouter = express.Router();

authRouter.post("/", async (req, res) => {
  const { email, password } = req.body || {};
  if (email == null || password == null) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }
  const user = await knex("users").select("*").where({ email }).first();
  if (!user) {
    return res.status(401).json({ error: true, message: "Email not found" });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: true, message: "Wrong password" });
  }
  if (!user.is_activated) {
    return res.status(401).json({ error: true, message: "User not activated" });
  }
  var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.status(200).json({
    error: false,
    message: "User authenticated successfully",
    token: token,
  });
});

export default authRouter;
