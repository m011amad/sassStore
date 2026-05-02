import Link from "next/link";
import type { Product } from "@/types";
import { Button } from "../ui/button";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="p-4 relative">
        <h3 className="truncate font-medium">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
          {product.stock === 0 && (
            <span className="text-xs text-muted-foreground">Out of stock</span>
          )}
        </div>
        <Button className="absolute px-6 bottom-3 right-3">Add</Button>
      </div>
    </Link>
  );
}
