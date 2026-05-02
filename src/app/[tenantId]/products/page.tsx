import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/storefront/product-card";

export default async function AllProductsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <div className="text-white">hi</div>
      </div>
    </div>
  );
}
