"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  stock: number;
  featured: boolean;
  active: boolean;
}

export default function AdminStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/admin/store");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/store/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Store</h1>
            <p className="text-muted mt-1">Manage products</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-sm p-12 text-center text-muted">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Store</h1>
          <p className="text-muted mt-1">Manage products</p>
        </div>
        <Link href="/admin/store/new">
          <Button size="sm">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Sale Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Featured</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-muted"
                  >
                    No products yet. Add your first product to get started.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-light/50">
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3 text-muted">{product.category}</td>
                  <td className="px-5 py-3 text-orange font-semibold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {product.salePrice
                      ? formatPrice(product.salePrice)
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        product.stock === 0 ? "text-error" : "text-foreground"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={product.featured ? "success" : "muted"}>
                      {product.featured ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={product.active ? "success" : "muted"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/store/${product.id}/edit`}
                        className="text-orange hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="text-error hover:underline inline-flex items-center gap-1 text-xs disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />{" "}
                        {deleting === product.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
