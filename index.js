import express from "express";
import authRouter from "./router/authenticate.js";
import registerRouter from "./router/register.js";
import searchRouter from "./router/search.js";
import chatRouter from "./router/chat.js";
import pantryRouter from "./router/pantry.js";
import mealRouter from "./router/meal.js";
import meRouter from "./router/me.js";

const app = express();
const port = 3002;
app.use(express.json());

app.use("/authenticate", authRouter);
app.use("/register", registerRouter);
app.use("/search", searchRouter);
app.use("/pantry", pantryRouter);
app.use("/chat", chatRouter);
app.use("/meal", mealRouter);
app.use("/me", meRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
});
