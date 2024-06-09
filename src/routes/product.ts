import Express from "express";
import { onlyAdmin } from "../middlewares/auth.js";
import {
  allCategories,
  deleteProduct,
  getAdminProducts,
  getAllProducts,
  getSingleProduct,
  latestProduct,
  newProduct,
  ourProducts,
  recommendedProducts,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = Express.Router();

//CREATE PRODUCT API --/API/V1/PRODUCT/NEW
app.post("/new", onlyAdmin, singleUpload, newProduct);

app.get("/search", getAllProducts);

//TO GET LAST 10 PRODUCT --/API/V1/PRODUCT/NEW/LATEST
app.get("/latest", latestProduct);

app.get('/recommended-products', recommendedProducts);
app.get('/ourProducts', ourProducts);

//TO GET ALL CATEGORY --/API/V1/PRODUCT/NEW/CATEGORIES
app.get("/categories", allCategories);

app.get("/admin-products", onlyAdmin, getAdminProducts);

app
  .route("/:id")
  .get(getSingleProduct)
  .put(onlyAdmin, singleUpload, updateProduct)
  .delete(onlyAdmin, deleteProduct);

export default app;
