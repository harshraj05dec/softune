import Express from "express";
import { onlyAdmin } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";

const app = Express.Router();

app.post("/new", newOrder);

app.get("/my", myOrders);

app.get("/all", onlyAdmin, allOrders);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(onlyAdmin, processOrder)
  .delete(onlyAdmin, deleteOrder);

export default app;
