"use client";

import useCartStore from "@/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "motion/react";
import { Check, Home, Package, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

interface OrderProduct {
  product: {
    name: string;
    image?: {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  };
  quantity: number;
}

interface Order {
  orderNumber: string;
  totalPrice: number;
  currency: string;
  customerName: string;
  email: string;
  status: string;
  products: OrderProduct[];
}

const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const { resetCart } = useCartStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber && !sessionId) {
      router.push("/");
    } else {
      resetCart();
    }
  }, [orderNumber, sessionId, resetCart, router]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 10;

    const fetchOrder = async () => {
      if (!orderNumber) return;
      try {
        const response = await fetch(`/api/order?orderNumber=${orderNumber}`);
        const data = await response.json();
        if (data.order) {
          setOrder(data.order);
          setLoading(false);
          clearInterval(intervalId);
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            setLoading(false);
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    if (orderNumber) {
      fetchOrder();
      intervalId = setInterval(fetchOrder, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderNumber]);

  return (
    <div className="py-10 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl px-8 py-12 max-w-2xl w-full text-center"
      >
        <motion.div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Check className="text-white w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order confirmed!
        </h1>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800 text-sm">
          Success! Your digital order has been processed. Check your email for
          delivery details.
        </div>

        <div className="space-y-4 mb-8 text-left border-b pb-8">
          <p className="text-gray-700">
            Thank you for your purchase. We&apos;re processing your order. A
            confirmation email with your order details has been sent to your
            inbox.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">
                Order Number
              </p>
              <p className="text-black font-semibold">{orderNumber}</p>
            </div>
            {order && (
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">
                  Sent To
                </p>
                <p className="text-black font-semibold">{order.email}</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Retrieving order details...</p>
          </div>
        ) : order ? (
          <div className="mb-8 text-left">
            <h2 className="text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.products.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <span className="font-medium text-gray-800">
                    {item.product.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-bold">Total Paid</span>
              <span className="font-bold text-xl">
                {order.totalPrice.toFixed(2)} {order.currency.toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-gray-500 italic">
            Order details are being updated. You can view them in your account
            in a few moments.
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-gray-900 mb-2">
            What&apos;s Next?
          </h2>
          <ul className="text-gray-700 text-sm space-y-1 text-left list-disc list-inside">
            <li>Check your email for order confirmation</li>
            <li>Digital items are sent immediately to your inbox</li>
            <li>Track your order status anytime in your dashboard</li>
          </ul>
        </div>

        {/* Order tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center px-4 py-3 font-semibold bg-white text-black border border-black rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-md"
          >
            <Package className="w-5 h-5 mr-2" />
            Orders
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="py-10 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-12 max-w-2xl w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading order status...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
