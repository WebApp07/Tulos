import { currentUser } from "@clerk/nextjs/server";
import CartIcon from "./CartIcon";
import Container from "./Container";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import { ClerkLoaded, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getAllCategories } from "@/sanity/helpers/queries";

const Header = async () => {
  const user = await currentUser();
  const categories = await getAllCategories();

  return (
    <header className="border-b border-b-gray-400 py-5">
      <Container className="flex items-center justify-between gap-7 text-lightColor">
        <HeaderMenu categories={categories} />
        <div className="w-auto md:w-1/3 flex items-center justify-center gap-2.5">
          <MobileMenu />
          <Logo>Tulos</Logo>
        </div>
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          <CartIcon />
        </div>

        <ClerkLoaded>
          <SignedIn>
            <Link href={"/cart"} className="group relative">
              <ShoppingBag className="w-5 h-5 group-hover:text-darkColor hoverEffect" />
              <span className="absolute -top-1 -right-1 bg-darkColor text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
                0
              </span>
            </Link>
            <UserButton />
          </SignedIn>
          {!user && (
            <SignInButton mode="modal">
              <button className="text-sm font-semibold hover:text-darkColor hoverEffect">
                Login
              </button>
            </SignInButton>
          )}
        </ClerkLoaded>
      </Container>
    </header>
  );
};

export default Header;
