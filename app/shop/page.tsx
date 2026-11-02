"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

import type {
  Category,
  CategoriesResponse,
  Product,
  ProductsResponse,
} from "./types";
import Link from "next/link";
const API_URL = "https://practice.amirm.me";
type Filters = {
  sort: string;
  category: string;
};

const getProducts = async ({
  sort,
  category,
}:Filters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.set("sort", sort);
  if (category) params.set("category", category);
  const res = await fetch(`${API_URL}/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error("خطا در دریافت محصولات");
  }
  return res.json();
};
const getCategories = async (): Promise<CategoriesResponse> => {
  const res = await fetch(`${API_URL}/categories`);

  if (!res.ok) {
    throw new Error("خطا در دریافت دسته‌بندی‌ها");
  }

  return res.json();
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch {
       
      }
    };

    loadCategories();
  }, []);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getProducts({ sort, category });
        setProducts(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "مشکلی پیش آمد");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sort, category]);

  return (
    
    <div className="mx-5">
      
      <select className="bg-black text-amber-50 font-bold border-2  border-amber-400 rounded-b-xl px-3 py-2 my-3" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option className="text-2xl font-bold " value="newest">جدیدترین</option>
        <option className="text-2xl font-bold " value="price">ارزان‌ترین</option>
        <option className="text-2xl font-bold " value="-price">گران‌ترین</option>
      </select>
      <select className="bg-black text-amber-100 ml-5 font-bold border-2 border-yellow-500 px-3 py-2 rounded-b-xl" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">همه‌ی دسته‌ها</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name} ({c.productCount.toLocaleString("fa-IR")})
          </option>
        ))}
      </select>
      {loading ? (
        <p className="text-4xl font-bold text-red-600">در حال بارگذاری...</p>
      ) : error ? (
        <p>{error}</p>
      ) : products.length === 0 ? (
        <p className="text-4xl font-bold text-red-600">محصولی پیدا نشد</p>
      ) : (
        <div className=" grid grid-cols-4 gap-4  ">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
