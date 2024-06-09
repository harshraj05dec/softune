import Express from "express";
import { onlyAdmin } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,

  checkout,


  deleteCoupon,
  newCoupon,
  paymentCanfirmation,
} from "../controllers/payment.js";

const app = Express.Router();

app.post("/checkout",checkout);
app.post("/paymentcanfirmation",paymentCanfirmation);


app.get("/discount", applyDiscount);

//Route - /api/v1/payment/coupon/new
app.post("/coupon/new", onlyAdmin, newCoupon);

//Route - /api/v1/payment/coupon/all
app.get("/coupon/all", onlyAdmin, allCoupons);

//Route - /api/v1/payment/coupon/:id
app.delete("/coupon/:id", onlyAdmin, deleteCoupon);

export default app;
