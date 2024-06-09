import Express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.js";
import { onlyAdmin } from "../middlewares/auth.js";

const app = Express.Router();

app.post("/new", newUser);

//Route - /api/v1/user/all
app.get("/all",onlyAdmin, getAllUsers);

//Route - /api/v1/user/all/fetch from id
app.route("/:id").get(getUser).delete(onlyAdmin,deleteUser);
export default app;
