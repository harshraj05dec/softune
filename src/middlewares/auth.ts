import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

//middleware to sure only admin is allowed
export const onlyAdmin = TryCatch(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("login first", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Invalidd id", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("You don't have permission to access ", 403));

  next();
});
