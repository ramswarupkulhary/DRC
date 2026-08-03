"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import ImageUpload from "@/components/admin/ImageUpload";

interface StoreFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice: number | null;
    category: string;
    images: string | null;
    sizes: string | null;
    stock: number;
    featured: boolean;
    active: boolean;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function StoreForm({ product }: StoreFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string | null>(product?.images || null);

  const parseSizes = (sizes: string | null): string => {
    if (!sizes) return "";
    try {
      const arr = JSON.parse(sizes);
      return Array.isArray(arr) ? arr.join(", ") : "";
    } catch {
      return "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const sizesRaw = (form.get("sizes") as string) || "";
    const sizesArray = sizesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      name: form.get("name"),
      description: form.get("description") || "",
      category: form.get("category"),
      price: parseInt(form.get("price") as string),
      salePrice: form.get("salePrice")
        ? parseInt(form.get("salePrice") as string)
        : null,
      sizes: sizesArray.length > 0 ? JSON.stringify(sizesArray) : null,
      stock: parseInt(form.get("stock") as string) || 0,
      featured: form.get("featured") === "on",
      active: form.get("active") === "on",
      images,
    };

    const url = product
      ? `/api/admin/store/${product.id}`
      : "/api/admin/store";
    const method = product ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save product");
        setSaving(false);
        return;
      }

      router.push("/admin/store");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">
          Basic Info
        </h3>
        <Input
          name="name"
          id="name"
          label="Product Name"
          defaultValue={product?.name}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-tan-light">
            Slug (auto-generated)
          </label>
          <p className="text-sm text-muted px-1">
            {product?.name
              ? slugify(product.name)
              : "Will be generated from product name"}
          </p>
        </div>
        <Textarea
          name="description"
          id="description"
          label="Description"
          defaultValue={product?.description}
          required
        />
        <Input
          name="category"
          id="category"
          label="Category"
          defaultValue={product?.category}
          required
        />
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">
          Product Image
        </h3>
        <ImageUpload value={images} onChange={setImages} label="Product Image" />
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">
          Pricing & Inventory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            name="price"
            id="price"
            label="Price (INR)"
            type="number"
            defaultValue={product?.price}
            required
          />
          <Input
            name="salePrice"
            id="salePrice"
            label="Sale Price (INR, optional)"
            type="number"
            defaultValue={product?.salePrice ?? ""}
          />
          <Input
            name="stock"
            id="stock"
            label="Stock"
            type="number"
            defaultValue={product?.stock ?? 0}
          />
          <Input
            name="sizes"
            id="sizes"
            label="Sizes (comma separated)"
            placeholder="S, M, L, XL"
            defaultValue={parseSizes(product?.sizes ?? null)}
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">
          Settings
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              defaultChecked={product?.featured}
              className="w-4 h-4 accent-orange"
            />
            <label htmlFor="featured" className="text-sm text-foreground">
              Featured product
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              id="active"
              defaultChecked={product?.active ?? true}
              className="w-4 h-4 accent-orange"
            />
            <label htmlFor="active" className="text-sm text-foreground">
              Active (visible in store)
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={saving}>
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
