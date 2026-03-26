import { getProducts } from "@/app/actions/products";
import { ProductsClient } from "@/components/products/ProductsClient";

export const metadata = {
  title: "Productos y Niveles | EduCRM",
};

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductsClient initialProducts={products} />;
}
