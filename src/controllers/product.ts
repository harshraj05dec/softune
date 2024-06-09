import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequesBody,
  SearchRequestQuery,
} from "../types/type.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
import products from "razorpay/dist/types/products.js";

// import { faker } from "@faker-js/faker";

export const latestProduct = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-products") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(4);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Function to get recommended products
export const recommendedProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("recommended-products")) {
    products = JSON.parse(myCache.get("recommended-products") as string);
  } else {
    products = await Product.find({}).sort({ category: 1 }).limit(4);
    myCache.set("recommended-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Function to get "our products" (assuming it's a specific category)
export const ourProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;

    if (myCache.has("our-products")) {
      products = JSON.parse(myCache.get("our-products") as string);
    } else {
      products = await Product.find({ category: "our-category" })
        .sort({ createdAt: -1 })
        .limit(4);
      myCache.set("our-products", JSON.stringify(products));
    }

    return res.status(200).json({
      success: true,
      products,
    });
  }
);

export const allCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product not found", 404));

    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequesBody>, res, next) => {
    const { name,productdetails,productdetails1,productdetails2, price, originalprice, stock, category } = req.body;
    const photo = req.file;
    const photo1 = req.file;

    if (!photo) return next(new ErrorHandler("Please upload photo", 400));

    if (!name || !productdetails|| !price || !originalprice || !stock || !category) {
      rm(photo.path, () => {
        console.log("deleted");
      });
      // rm(photo1.path, () => {
      //   console.log("deleted");
      // });
    
      return next(new ErrorHandler("Please enter all field", 400));
    }
    await Product.create({
      name,
      productdetails,
      productdetails1,
      productdetails2,
      price,
      originalprice,
      stock,
      category: category.toLowerCase(),
      photo: photo?.path,

     
    });

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product created successfuly",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const { name,productdetails,productdetails1,productdetails2, price, originalprice, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("old photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (productdetails) product.productdetails = productdetails;
  if (productdetails1) product.productdetails1 = productdetails1;
  if (productdetails2) product.productdetails2 = productdetails2;
  if (price) product.price = price;
  if (originalprice) product.originalprice = originalprice;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfuly",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  rm(product.photo!, () => {
    console.log("Product photo deleted");
  });

  await product.deleteOne();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product deleted successfuly",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };
    if (category) baseQuery.category = category;

    const productPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\0de09341-69ab-4943-b37d-76e2d4bfe922.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       originalprice: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };
//     products.push(product);
//   }
//   await Product.create(products);

//   console.log({ success: true });
// };

// const deleteRandomProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ success: true });
// };
