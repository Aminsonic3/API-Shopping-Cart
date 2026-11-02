import React from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  image: string;
  description: string;
  stock: number;
  category: Pick<Category, "id" | "slug" | "name">;
};

export type ProductsResponse = {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type Category = {
  id: number;
  slug: string;
  name: string;
  productCount: number;
};

export type CategoriesResponse = {
  data: Category[];
};
export type CartItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};