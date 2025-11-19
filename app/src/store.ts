import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./features/theme/themeSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      theme: themeReducer,
    },
    devTools: import.meta.env.MODE !== "production",
  });

export const store = makeStore();
export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
