import ProductFormClient from "@/app/admin/products/components/ProductFormClient";

export default async function EditProductPage({ params }: any) {
  const { id } = await params;
  return <ProductFormClient mode="edit" productId={id} />;
}
