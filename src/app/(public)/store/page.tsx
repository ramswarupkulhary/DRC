import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Store" };

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <SectionHeader
        accent="Rep the tribe"
        title="DRC Store"
        subtitle="Premium riding gear and branded merchandise."
      />

      {categories.map((cat) => (
        <div key={cat} className="mt-12">
          <h3 className="font-heading text-xl font-bold uppercase text-tan mb-6">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p) => p.category === cat)
              .map((product) => {
                const sizes = product.sizes ? (JSON.parse(product.sizes) as string[]) : [];
                return (
                  <div key={product.id} className="bg-surface border border-border rounded-sm overflow-hidden group">
                    <div className="aspect-[4/3] bg-surface-light flex items-center justify-center relative">
                      <ShoppingBag className="w-12 h-12 text-muted/20" />
                      {product.featured && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="orange">Featured</Badge>
                        </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="error">Low Stock</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="font-heading text-lg font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted line-clamp-2">{product.description}</p>
                      {sizes.length > 0 && (
                        <div className="flex gap-1.5">
                          {sizes.map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 border border-border rounded-sm text-muted">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xl font-bold text-orange">
                            &#8377;{(product.salePrice || product.price).toLocaleString("en-IN")}
                          </span>
                          {product.salePrice && (
                            <span className="text-sm text-muted line-through">&#8377;{product.price.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        <Link href="/login?redirect=/store">
                          <Button size="sm">Add to Cart</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
