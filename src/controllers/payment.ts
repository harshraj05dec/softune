import Razorpay from "razorpay";
import { instance } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
import { Request, Response, NextFunction } from "express";
import crypto = require('crypto');


export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Please enter amount", 400));

  const options = {
    amount: Number(amount) * 100, // Amount in paise (smallest currency unit)
    currency: "INR",
  };

  try {
    const order = await instance.orders.create(options);

    res.json({
      success: true,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
    });
  } catch (error) {
    res.status(500).json({ success: false});
  }


};
export const paymentCanfirmation = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(body.toString())
  .digest('hex');
 
  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 404));

  await Coupon.create({ code: coupon, amount });

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} Created Sucessfully`,
  });
});



export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon Id", 400));

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Deleted Sucessfully`,
  });
});
