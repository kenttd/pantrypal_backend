import express from "express";
import auth from "../middleware/auth.js";
import knex from "../knex.js";
const mealRouter = express.Router();

// mealRouter.use(auth);

mealRouter.get("/random", async (req, res) => {
  try {
    const randomMeal = await fetch(
      `https://themealdb.com/api/json/v1/1/random.php`
    );
    const data = await randomMeal.json();
    if (data.meals == null) {
      return res.status(404).json({ error: true, message: "Meal not found" });
    }
    const meal = data.meals[0];
    return res.status(200).json(meal);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

mealRouter.get("/data-filter", async (req, res) => {
  try {
    const areas = await knex("meal_areas").select();
    const categories = await knex("meal_categories").select();
    const ingredients = await knex("meal_ingredients").select();

    return res.status(200).json({
      areas: areas,
      categories: categories,
      ingredients: ingredients,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

mealRouter.get("/filter/area", async (req, res) => {
  try {
    const { area } = req.query;
    if (!area) {
      return res.status(400).json({ error: true, message: "Area is required" });
    }
    const exist = await knex("meal_areas")
      .select("*")
      .where({ strArea: area })
      .first();
    if (!exist) {
      return res.status(404).json({ error: true, message: "Area not found" });
    }
    const list = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
    );
    const data = await list.json();
    if (data.meals == null) {
      return res.status(404).json({ error: true, message: "Meal not found" });
    }
    return res.status(200).json(data.meals);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

mealRouter.get("/filter/category", async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ error: true, message: "Category is required" });
    }
    const exist = await knex("meal_categories")
      .select("*")
      .where({ strCategory: category })
      .first();
    if (!exist) {
      return res
        .status(404)
        .json({ error: true, message: "Category not found" });
    }
    const list = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    const data = await list.json();
    if (data.meals == null) {
      return res.status(404).json({ error: true, message: "Meal not found" });
    }
    return res.status(200).json(data.meals);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

mealRouter.get("/filter/ingredient", async (req, res) => {
  try {
    const { ingredient } = req.query;
    if (!ingredient) {
      return res
        .status(400)
        .json({ error: true, message: "Ingredient is required" });
    }
    const exist = await knex("meal_ingredients")
      .select("*")
      .where({ strIngredient: ingredient })
      .first();
    if (!exist) {
      return res
        .status(404)
        .json({ error: true, message: "Ingredient not found" });
    }
    const list = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    const data = await list.json();
    if (data.meals == null) {
      return res.status(404).json({ error: true, message: "Meal not found" });
    }
    return res.status(200).json(data.meals);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

mealRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: true, message: "ID is required" });
    }
    const meal = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const data = await meal.json();
    if (data.meals == null) {
      return res.status(404).json({ error: true, message: "Meal not found" });
    }
    return res.status(200).json(data.meals[0]);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

export default mealRouter;
