import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequesBody } from "../types/type.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequesBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo,  _id } = req.body;

    let user = await User.findById(_id);

    if (user)
      return res.status(200).json({
        success: true,
        message: `welcome back, ${user.name}`,
      });
    if (!_id || !name || !email || !photo)
      return next(new ErrorHandler("Please enter all field", 400));

    user = await User.create({
      name,
      email,
      photo,
      _id,
    });
    return res.status(201).json({
      success: true,
      message: `welcome , ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});
export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid id", 400));

  return res.status(200).json({
    success: true,
    user,
  });
});
export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid id", 400));

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Users deleted successful",
  });
});
