import express from "express";
import auth from "../middleware/auth.js";
const searchRouter = express.Router();

searchRouter.use(auth);

searchRouter.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await fetch(
      `https://world.openfoodfacts.net/api/v2/product/${q}`
    );
    const data = await response.json();
    if (data.status === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }
    const product = data.product;
    const ecoscore_data = product.ecoscore_data;
    const ingredients = product.ingredients ?? [];
    const nutriments = product.nutriments;
    const grade = ecoscore_data.grade;
    const missing = ecoscore_data.missing;
    const allergens = product.allergens_hierarchy
      .map((item) => {
        return item.split(":")[1];
      })
      .join(", ");
    const small_image_url = product.image_front_small_url;
    const image_url = product.image_front_url;

    res.status(200).json({
      error: false,
      product_name: product.product_name,
      ingredients: ingredients,
      nutriments: nutriments,
      grade: grade,
      missing: missing,
      allergens: allergens == [] ? null : allergens,
      small_image_url,
      image_url,
      barcode: data.code,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: err.message,
    });
  }
});

export default searchRouter;
