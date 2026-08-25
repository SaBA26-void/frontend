import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/lib/features/cart/cartSlice";
import { onlineShopApi } from "@/lib/features/api/onlineShopApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      [onlineShopApi.reducerPath]: onlineShopApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(onlineShopApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
