import express from "express";
import auth from "../middleware/auth.js";
import knex from "../knex.js";
const pantryRouter = express.Router();

pantryRouter.use(auth);

pantryRouter.post("/", async (req, res) => {
  try {
    const { data } = req.body;
    await knex("pantry_items").insert({
      user_id: req.user.id,
      barcode: data.barcode,
      data: data,
    });
    res.status(201).json({
      error: false,
      message: "Item added to pantry",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to add item to pantry",
    });
  }
});

pantryRouter.get("/", async (req, res) => {
  try {
    const pantryItems = await knex("pantry_items")
      .select("*")
      .where({ user_id: req.user.id });
    res.status(200).json({
      error: false,
      data: pantryItems.map((item) => {
        return {
          id: item.id,
          barcode: item.barcode,
          expired_at: item.expired_at,
          data: JSON.parse(item.data),
          created_at: item.created_at,
        };
      }),
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch pantry items",
    });
  }
});

pantryRouter.get("/:id", async (req, res) => {
  try {
    const pantryItem = await knex("pantry_items")
      .select("*")
      .where({ user_id: req.user.id, id: req.params.id })
      .first();
    if (!pantryItem) {
      return res.status(404).json({
        error: true,
        message: "Pantry item not found",
      });
    }
    res.status(200).json({
      error: false,
      data: pantryItem,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch pantry items",
    });
  }
});

pantryRouter.delete("/:id", async (req, res) => {
  try {
    const pantryItem = await knex("pantry_items")
      .where({ user_id: req.user.id, id: req.params.id })
      .del();
    if (!pantryItem) {
      return res.status(404).json({
        error: true,
        message: "Pantry item not found",
      });
    }
    res.status(200).json({
      error: false,
      message: "Pantry item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete pantry item",
    });
  }
});

pantryRouter.put("/:id", async (req, res) => {
  const { expired_at } = req.body;
  try {
    const pantryItem = await knex("pantry_items")
      .where({ user_id: req.user.id, id: req.params.id })
      .update({ expired_at });
    if (!pantryItem) {
      return res.status(404).json({
        error: true,
        message: "Pantry item not found",
      });
    }
    res.status(200).json({
      error: false,
      message: "Pantry item updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to update pantry item",
    });
  }
});

pantryRouter.get("/expired", async (req, res) => {
  try {
    const expiredItems = await knex("pantry_items")
      .select("*")
      .where({ user_id: req.user.id })
      .andWhere("expired_at", "<", new Date());

    res.status(200).json({
      error: false,
      data: expiredItems,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch expired pantry items",
    });
  }
});

export default pantryRouter;
