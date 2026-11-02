"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cart } from "../shop/types";

const API_URL = "https://practice.amirm.me";
const TOKEN_KEY = "token";
const LOGIN_URL = "/login?redirect=/cart";

class AuthError extends Error {}

const cartRequest = async (
  path: string,
  method = "GET",
  body?: object
): Promise<Cart | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new AuthError();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) throw new AuthError();

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "مشکلی پیش آمد");
  }

  if (res.status === 204) return null;

  return res.json();
};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await cartRequest("/me/cart");
        setCart(data);
      } catch (err) {
        if (err instanceof AuthError) {
          router.push(LOGIN_URL);
          return;
        }
        setError(err instanceof Error ? err.message : "مشکلی پیش آمد");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const runAction = async (action: () => Promise<Cart | null>) => {
    setBusy(true);
    setActionError(null);

    try {
      const data = await action();
      setCart(data);
    } catch (err) {
      if (err instanceof AuthError) {
        router.push(LOGIN_URL);
        return;
      }
      setActionError(err instanceof Error ? err.message : "مشکلی پیش آمد");
    } finally {
      setBusy(false);
    }
  };

  const changeQuantity = (productId: number, quantity: number) =>
    runAction(() =>
      cartRequest(`/me/cart/items/${productId}`, "PATCH", { quantity })
    );

  const removeItem = (productId: number) =>
    runAction(() => cartRequest(`/me/cart/items/${productId}`, "DELETE"));

  const clearCart = () => runAction(() => cartRequest("/me/cart", "DELETE"));

  if (loading) return <p>در حال بارگذاری...</p>;
  if (error) return <p>{error}</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <p>سبد خرید خالی است</p>
        <Link href="/shop" className="underline">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {cart.items.map((item) => {
        const maxQuantity = Math.min(item.product.stock, 10);

        return (
          <div
            key={item.product.id}
            className="flex items-center gap-4 border-b py-3"
          >
            <img
              className="w-20 h-20 object-contain"
              src={`${API_URL}${item.product.image}`}
              alt={item.product.name}
            />

            <div className="flex-1">
              <p className="font-bold">{item.product.name}</p>
              <p>{item.product.price.toLocaleString("fa-IR")} تومان</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="border rounded px-3 py-1 disabled:opacity-50"
                onClick={() =>
                  changeQuantity(item.product.id, item.quantity - 1)
                }
                disabled={busy || item.quantity <= 1}
              >
                -
              </button>

              <span className="font-bold">
                {item.quantity.toLocaleString("fa-IR")}
              </span>

              <button
                className="border rounded px-3 py-1 disabled:opacity-50"
                onClick={() =>
                  changeQuantity(item.product.id, item.quantity + 1)
                }
                disabled={busy || item.quantity >= maxQuantity}
              >
                +
              </button>
            </div>

            <p className="w-32 text-left">
              {item.subtotal.toLocaleString("fa-IR")} تومان
            </p>

            <button
              className="text-red-500 disabled:opacity-50"
              onClick={() => removeItem(item.product.id)}
              disabled={busy}
            >
              حذف
            </button>
          </div>
        );
      })}

      <p className="text-2xl font-bold my-4">
        جمع کل: {cart.totalPrice.toLocaleString("fa-IR")} تومان
      </p>

      {actionError && <p className="text-red-500 font-bold">{actionError}</p>}

      <div className="flex gap-3 mt-4">
        <button
          className="border rounded px-4 py-2 disabled:opacity-50"
          onClick={clearCart}
          disabled={busy}
        >
          خالی کردن سبد
        </button>

        <Link
          href="/checkout"
          className="bg-black text-white rounded px-4 py-2"
        >
          ادامه‌ی خرید
        </Link>
      </div>
    </div>
  );
}