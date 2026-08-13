"use client";
import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import Loading from "@/components/Loading";
import NoAccessToCart from "@/components/NoAccessToCart";
import PriceFormatter from "@/components/PriceFormatter";
import QuantityButtons from "@/components/QuantityButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { urlFor } from "@/sanity/lib/image";
import useCartStore, { CartItem } from "@/store";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Heart, ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";
import { PayPalButtons } from "@/components/PayPalButtons";
import { useCurrency } from "@/components/CurrencyProvider";

const CartPage = () => {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const tSearch = useTranslations("search");
  const { currency } = useCurrency();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const { isSignedIn } = useAuth();
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubtotalPrice,
    resetCart,
    getGroupedItems,
  } = useCartStore();
  const { user } = useUser();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setCustomerName(user.fullName ?? "");
      setCustomerEmail(user.emailAddresses[0]?.emailAddress ?? "");
    }
  }, [user]);
  if (!isClient) {
    return <Loading />;
  }
  const cartProducts = getGroupedItems();
  const canCheckout = isSignedIn || guestMode;

  const handleResetCart = () => {
    const confirmed = window.confirm(t("confirmReset"));
    if (confirmed) {
      resetCart();
      toast.success(t("cartReset"));
    }
  };
  const handleDeleteProduct = (
    id: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => {
    deleteCartProduct(id, selectedVariant);
    toast.success(t("productDeleted"));
  };

  const handleCheckout = async () => {
    if (!customerName || !customerEmail) {
      toast.error(t("enterNameEmail"));
      return;
    }
    setLoading(true);
    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName,
        customerEmail,
        clerkUserId: user?.id,
      };
      const checkoutUrl = await createCheckoutSession(
        cartProducts,
        metadata,
        currency,
      );
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {canCheckout ? (
        <Container>
          {!isSignedIn && guestMode && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">{t("guestBanner")}</p>
                <p className="text-sm text-lightColor">{t("guestNote")}</p>
              </div>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="font-semibold shrink-0">
                  {t("guestSignIn")}
                </Button>
              </SignInButton>
            </div>
          )}
          {cartProducts?.length ? (
            <>
              <div className="flex items-center gap-2 py-5">
                <ShoppingBag />
                <h1 className="text-2xl font-semibold">{t("title")}</h1>
              </div>
              <div className="grid lg:grid-cols-3 md:gap-8">
                {/* Products */}
                <div className="lg:col-span-2 rounded-lg">
                  <div className="border bg-white rounded-md">
                    {cartProducts?.map(({ product, selectedVariant }) => {
                      const itemCount = getItemCount(
                        product?._id,
                        selectedVariant,
                      );
                      return (
                        <div
                          key={`${product?._id}-${selectedVariant?.variantSku || ""}-${selectedVariant?.color || ""}-${selectedVariant?.size || ""}`}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 items-center gap-2 h-36 md:h-44">
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group"
                              >
                                <Image
                                  src={urlFor(product?.images[0]).url()}
                                  alt={tSearch("productImage")}
                                  width={500}
                                  height={500}
                                  loading="lazy"
                                  className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 overflow-hidden hoverEffect"
                                />
                              </Link>
                            )}
                            <div className="h-full flex flex-1 items-start flex-col justify-between py-1">
                              <div className="space-y-1.5">
                                <h2 className="font-semibold line-clamp-1">
                                  {product?.name}
                                </h2>
                                <p className="text-sm text-lightColor font-medium">
                                  {product?.intro}
                                </p>
                                <p className="text-sm capitalize">
                                  {tCommon("variant")}:{" "}
                                  <span className="font-semibold">
                                    {selectedVariant
                                      ? `${selectedVariant.color || ""} / ${selectedVariant.size || ""}`
                                      : tCommon("default")}
                                  </span>
                                </p>
                                <p className="text-sm capitalize">
                                  {tCommon("status")}:{" "}
                                  <span className="font-semibold">
                                    {product?.status}
                                  </span>
                                </p>
                              </div>
                              <div className="text-gray-500 flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Heart className="w-4 h-4 md:w-5 md:h-5 hover:text-green-600 hoverEffect" />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold">
                                      {t("addToFavorite")}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() =>
                                          handleDeleteProduct(
                                            product?._id,
                                            selectedVariant,
                                          )
                                        }
                                        className="w-4 h-4 md:w-5 md:h-5 hover:text-red-600 hoverEffect"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold bg-red-600">
                                      {t("deleteProduct")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                              <PriceFormatter
                                amount={
                                  (selectedVariant?.price ||
                                    (product?.price as number)) * itemCount
                                }
                                className="font-bold text-lg"
                              />
                              <QuantityButtons
                                product={product}
                                selectedVariant={selectedVariant}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      onClick={handleResetCart}
                      className="m-5 font-semibold"
                      variant="destructive"
                    >
                      {t("resetCart")}
                    </Button>
                  </div>
                </div>
                {/* summary */}
                <div className="lg:col-span-1">
                  <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">
                      {t("orderSummary")}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>{tCommon("subtotal")}</span>
                        <PriceFormatter amount={getSubtotalPrice()} />
                      </div>
                      <div className="flex justify-between">
                        <span>{tCommon("discount")}</span>
                        <PriceFormatter
                          amount={getSubtotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>{tCommon("total")}</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="text-lg font-bold text-black"
                        />
                      </div>
                      <div className="space-y-3 py-2">
                        <div className="space-y-1">
                          <Label htmlFor="customerName">{t("fullName")}</Label>
                          <Input
                            id="customerName"
                            type="text"
                            placeholder={t("namePlaceholder")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="customerEmail">{t("emailAddress")}</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            required
                            className="bg-white"
                          />
                        </div>
                        <p className="text-xs text-lightColor italic">
                          {t("deliveryNote")}
                        </p>
                      </div>
                      <Button
                        disabled={loading}
                        onClick={handleCheckout}
                        className="w-full rounded-full font-semibold tracking-wide"
                        size="lg"
                      >
                        {t("payStripe")}
                      </Button>
                      <p className="text-[10px] text-center text-gray-400 mt-1">
                        {t("stripeHint")}
                      </p>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">
                            {t("orPayWith")}
                          </span>
                        </div>
                      </div>
                      <PayPalButtons
                        items={cartProducts}
                        totalPrice={getTotalPrice()}
                        metadata={{
                          customerName,
                          customerEmail,
                          clerkUserId: user?.id || "",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Order summary for mobile view */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2">
                  <div className="p-4 rounded-lg border mx-4">
                    <h2 className="text-xl font-semibold mb-4">
                      {t("orderSummary")}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>{tCommon("subtotal")}</span>
                        <PriceFormatter amount={getSubtotalPrice()} />
                      </div>
                      <div className="flex justify-between">
                        <span>{tCommon("discount")}</span>
                        <PriceFormatter
                          amount={getSubtotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>{tCommon("total")}</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="text-lg font-bold text-black"
                        />
                      </div>
                      <div className="space-y-3 py-2">
                        <div className="space-y-1">
                          <Label htmlFor="customerNameMobile">{t("fullName")}</Label>
                          <Input
                            id="customerNameMobile"
                            type="text"
                            placeholder={t("namePlaceholder")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="customerEmailMobile">
                            {t("emailAddress")}
                          </Label>
                          <Input
                            id="customerEmailMobile"
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            required
                            className="bg-white"
                          />
                        </div>
                        <p className="text-xs text-lightColor italic">
                          {t("deliveryNote")}
                        </p>
                      </div>
                      <Button
                        onClick={handleCheckout}
                        className="w-full rounded-full font-semibold tracking-wide"
                        size="lg"
                      >
                        {t("payStripe")}
                      </Button>
                      <p className="text-[10px] text-center text-gray-400 mt-1">
                        {t("stripeHint")}
                      </p>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">
                            {t("orPayWith")}
                          </span>
                        </div>
                      </div>
                      <PayPalButtons
                        items={cartProducts}
                        totalPrice={getTotalPrice()}
                        metadata={{
                          customerName,
                          customerEmail,
                          clerkUserId: user?.id || "",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccessToCart onContinueAsGuest={() => setGuestMode(true)} />
      )}
    </div>
  );
};

export default CartPage;
