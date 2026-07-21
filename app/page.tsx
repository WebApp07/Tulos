import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Container>
        <h2>Tulos Ecommerce Website</h2>
        <Button variant="outline">Add To Cart</Button>
      </Container>
    </div>
  );
}
