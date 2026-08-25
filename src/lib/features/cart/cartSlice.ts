import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductDto, ProductVariantDto } from "@/types/api";

export interface CartItem {
  productId: number;
  variantId: number | null;
  productName: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

function cartKey(productId: number, variantId: number | null) {
  return `${productId}:${variantId ?? "base"}`;
}

function displayName(
  productName: string,
  size: string | null | undefined,
  color: string | null | undefined,
) {
  const optionLabel = [size, color].filter(Boolean).join(" / ");
  return optionLabel ? `${productName} (${optionLabel})` : productName;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: ProductDto; variant?: ProductVariantDto | null }>,
    ) => {
      const { product, variant } = action.payload;
      const variantId = variant?.id ?? null;
      const existing = state.items.find(
        (item) =>
          cartKey(item.productId, item.variantId) === cartKey(product.id, variantId),
      );

      if (existing) {
        existing.quantity += 1;
        return;
      }

      const size = variant?.size ?? null;
      const color = variant?.color ?? null;

      state.items.push({
        productId: product.id,
        variantId,
        productName: product.name,
        name: displayName(product.name, size, color),
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        size,
        color,
      });
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: number; variantId: number | null }>,
    ) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (item) =>
          cartKey(item.productId, item.variantId) !== cartKey(productId, variantId),
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: number;
        variantId: number | null;
        quantity: number;
      }>,
    ) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        (cartItem) =>
          cartKey(cartItem.productId, cartItem.variantId) ===
          cartKey(productId, variantId),
      );

      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.items = state.items.filter(
          (cartItem) =>
            cartKey(cartItem.productId, cartItem.variantId) !==
            cartKey(productId, variantId),
        );
        return;
      }

      item.quantity = quantity;
    },
    changeCartItemVariant: (
      state,
      action: PayloadAction<{
        productId: number;
        fromVariantId: number | null;
        toVariant: ProductVariantDto;
      }>,
    ) => {
      const { productId, fromVariantId, toVariant } = action.payload;
      const fromKey = cartKey(productId, fromVariantId);
      const toKey = cartKey(productId, toVariant.id);

      const itemIndex = state.items.findIndex(
        (cartItem) => cartKey(cartItem.productId, cartItem.variantId) === fromKey,
      );
      if (itemIndex < 0) {
        return;
      }

      const item = state.items[itemIndex];

      if (fromKey === toKey) {
        return;
      }

      const existingTargetIndex = state.items.findIndex(
        (cartItem) => cartKey(cartItem.productId, cartItem.variantId) === toKey,
      );

      if (existingTargetIndex >= 0) {
        state.items[existingTargetIndex].quantity += item.quantity;
        state.items.splice(itemIndex, 1);
        return;
      }

      item.variantId = toVariant.id;
      item.size = toVariant.size;
      item.color = toVariant.color;
      item.name = displayName(item.productName, toVariant.size, toVariant.color);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  changeCartItemVariant,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
