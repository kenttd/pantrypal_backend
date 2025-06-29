import express from "express";
import knex from "../knex.js";
const registerRouter = express.Router();

registerRouter.post("/", async (req, res) => {
  const { username, password, dob, email, confirm_password } = req.body;
  if (
    username == null ||
    password == null ||
    dob == null ||
    email == null ||
    confirm_password == null
  ) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }
  if (password !== confirm_password) {
    return res
      .status(400)
      .json({ error: true, message: "Passwords do not match" });
  }
  const user = await knex("users").select("*").where({ username }).first();
  if (user) {
    return res
      .status(400)
      .json({ error: true, message: "User registered already" });
  }
  await knex("users").insert({
    username,
    password,
    email,
    dob: new Date(dob),
    is_activated: true,
  });
  res.json({
    error: false,
    message: "User registered successfully",
  });
});

export default registerRouter;
