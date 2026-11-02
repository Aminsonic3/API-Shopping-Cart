"use client";
import { useEffect, useState } from "react";
import type { Product } from "../types";
import { useParams, useRouter } from "next/navigation";

const API_URL = "https://practice.amirm.me";
const TOKEN_KEY = "token";
const getProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (res.status === 404) {
    throw new Error("محصول پیدا نشد");
  }
  if (!res.ok) {
    throw new Error("خطا در دریافت محصول");
  }
  return res.json();
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [add, setAdd] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "مشکلی پیش آمد");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  if (loading) return <p>در حال بارگذاری...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return null;
  const maxQuantity = Math.min(product.stock, 10);
  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push(`/login?redirect=/shop/${id}`);
      return;
    }
    setAdd(true);
    setCartMessage(null);
    try {
      const res = await fetch(`${API_URL}/me/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=/shop/${id}`);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setCartMessage(body?.error ?? "خطا در افزودن به سبد");
        return;
      }
      setCartMessage("به سبد اضافه شد");
    } catch {
      setCartMessage("اتصال به سرور برقرار نشد");
    } finally {
      setAdd(false);
    }
  };

  return (
    <div className=" mt-3 flex flex-col gap-2  items-center w-3xl bg-purple-500 ml-60">
      <h1 className="text-4xl font-bold pt-2  ">{product.name}</h1>
      <img
        className="w-full h-80"
        src={`${API_URL}${product.image}`}
        alt="{product.name}"
      ></img>
      <p className="text-3xl font-mono pt-3 text-yellow-400">
        {product.price.toLocaleString("fa-IR")}تومان
      </p>
      <p className="text-2xl font-semibold text-amber-100">
        {product.description}
      </p>
      <p className="text-3xl font-bold text-purple-900">
        دسته: {product.category.name}
      </p>
      {product.inStock ? (
        <p className="text-teal-200 text-2xl pb-2">
          {" "}
          {product.stock.toLocaleString("fa-IR")} : عدد موجود
        </p>
      ) : (
        <p><span className="font-bold text-red-500 border rounded-4xl px-3 py-2">
        ناموجود
      </span> </p>
      )}
      <button
        onClick={() => setQuantity((q) => q - 1)}
        disabled={quantity <= 1}
      >
        -
      </button>
      
      <button
        onClick={() => setQuantity((q) => q + 1)}
        disabled={quantity >= maxQuantity}
      >
        +
      </button>
      <button
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAddToCart}
        disabled={!product.inStock || add}
      >
        {add ? "در حال افزودن..." : "افزودن به سبد"}
      </button>
      {cartMessage && <p className="font-bold">{cartMessage}</p>}
    </div>
  );
}
