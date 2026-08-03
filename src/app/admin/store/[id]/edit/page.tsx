export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StoreForm from "@/components/admin/StoreForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    category: product.category,
    images: product.images,
    sizes: product.sizes,
    stock: product.stock,
    featured: product.featured,
    active: product.active,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Product</h1>
        <p className="text-muted mt-1">{product.name}</p>
      </div>
      <StoreForm product={productData} />
    </div>
  );
}
