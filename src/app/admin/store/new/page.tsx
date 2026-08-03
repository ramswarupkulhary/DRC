import StoreForm from "@/components/admin/StoreForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">New Product</h1>
        <p className="text-muted mt-1">Add a new product to the store</p>
      </div>
      <StoreForm />
    </div>
  );
}
