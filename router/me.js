import express from "express";
import auth from "../middleware/auth.js";
import knex from "../knex.js";
const meRouter = express.Router();

meRouter.use(auth);

meRouter.get("/", async (req, res) => {
  try {
    const user = await knex("users")
      .select("id", "username", "email", "dob", "is_activated")
      .where({ id: req.user.id })
      .first();
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.status(200).json({ error: false, user });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

export default meRouter;
