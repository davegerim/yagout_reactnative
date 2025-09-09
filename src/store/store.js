import { configureStore } from '@reduxjs/toolkit';
import cartSlice from './cartSlice';
import productsSlice from './productsSlice';
import authSlice from './authSlice';
import yagoutPaySlice from './yagoutPaySlice';

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    products: productsSlice,
    auth: authSlice,
    yagoutPay: yagoutPaySlice,
  },
});