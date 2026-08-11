import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./sanity.types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    variantSku?: string;
    variantImage?: {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
    stock?: number;
    price?: number;
  } | null;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  removeItem: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  deleteCartProduct: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getItemCount: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => number;
  getGroupedItems: () => CartItem[];
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, selectedVariant) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.product._id === product._id &&
              item.selectedVariant?.variantSku === selectedVariant?.variantSku &&
              item.selectedVariant?.color === selectedVariant?.color &&
              item.selectedVariant?.size === selectedVariant?.size,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id &&
                item.selectedVariant?.variantSku ===
                  selectedVariant?.variantSku &&
                item.selectedVariant?.color === selectedVariant?.color &&
                item.selectedVariant?.size === selectedVariant?.size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return {
              items: [...state.items, { product, quantity: 1, selectedVariant }],
            };
          }
        }),
      removeItem: (productId, selectedVariant) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (
              item.product._id === productId &&
              item.selectedVariant?.variantSku ===
                selectedVariant?.variantSku &&
              item.selectedVariant?.color === selectedVariant?.color &&
              item.selectedVariant?.size === selectedVariant?.size
            ) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),
      deleteCartProduct: (productId, selectedVariant) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product._id === productId &&
                item.selectedVariant?.variantSku ===
                  selectedVariant?.variantSku &&
                item.selectedVariant?.color === selectedVariant?.color &&
                item.selectedVariant?.size === selectedVariant?.size
              ),
          ),
        })),
      resetCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant?.price || item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      getSubtotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant?.price || item.product.price || 0;
          const discount = ((item.product.discount ?? 0) * price) / 100;
          const discountedPrice = price + discount;
          return total + discountedPrice * item.quantity;
        }, 0);
      },
      getItemCount: (productId, selectedVariant) => {
        const item = get().items.find(
          (item) =>
            item.product._id === productId &&
            item.selectedVariant?.variantSku === selectedVariant?.variantSku &&
            item.selectedVariant?.color === selectedVariant?.color &&
            item.selectedVariant?.size === selectedVariant?.size,
        );
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
    }),
    { name: "cart-store" },
  ),
);

export default useCartStore;
