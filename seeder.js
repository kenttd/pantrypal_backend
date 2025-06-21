import areas from "./areas.js";
import categories from "./categories.js";
import ingredients from "./ingredients.js";
import knex from "./knex.js";

async function seed() {
  await knex("meal_categories").insert(categories);
  await knex("meal_areas").insert(areas.meals);
  await knex("meal_ingredients").insert(ingredients.meals);
  return;
}

seed();
