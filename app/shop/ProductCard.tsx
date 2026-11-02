const API_URL = "https://practice.amirm.me";

import Link from "next/link";
import type { Product } from "./types";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  return (
    <div>
      <Link
        className="flex flex-col items-center text-center relative w-full h-full bg-blue-400  px-5"
        href={`/shop/${product.id}`}
      >
        <h3 className="text-3xl font-bold">{product.name}</h3>
        <img
          className="w-full h-40 object-contain"
          src={`${API_URL}${product.image}`}
          alt={product.name}
        ></img>

        <p className="text-yellow-400 text-2xl font-serif font-bold">
          {product.price.toLocaleString("fa-IR")} تومان
        </p>
        {!product.inStock && (
          <span className="mt-auto font-bold text-red-500 border rounded-4xl px-3 py-2 my-2">
            {" "}
            نا موجود
          </span>
        )}
      </Link>
    </div>
  );
};

export default ProductCard;
