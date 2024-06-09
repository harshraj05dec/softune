import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    productdetails: {
      type: String,
      required: [true, "Please enter product details"],
    },
    productdetails1: {
      type: String,
      required: [true, "Please enter category"],
    },
    productdetails2: {
      type: String,
      required: [true, "Please enter category"],
    },
    photo: {
      type: String,
      required: [true, "Please upload photo"],
    },
    price: {
      type: Number,
      required: [true, "Please enter price"],
    },
    originalprice: {
      type: Number,
      required: [true, "Please enter orignalprice"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", schema);
