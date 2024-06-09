import { NextFunction, Request, Response } from "express";

export interface NewUserRequesBody {
  name: string;
  email: string;
  photo: string;
  gender: string;

  _id: string;
  dob: Date;
}
export interface NewProductRequesBody {
  name: string;
  productdetails: string;
  productdetails1: string;
  productdetails2: string;
  category: string;
  photo: string;

  price: number;
  originalprice: number;
  stock: number;
}

export type ContrllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};
export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
}

export type InvalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type OrderItemType = {
  name: string;
  productdetails: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;

};
export type ShippingInfoType = {
  email: string;
  mobnumber: number;
};

export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}
