import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import { getAllCategories } from "@/sanity/helpers/queries";

export default async function Home() {
  const categories = await getAllCategories();

  return (
    <div className="">
      <Container className="py-10">
        <HomeBanner />
        <ProductGrid categories={categories} />
      </Container>
    </div>
  );
}
