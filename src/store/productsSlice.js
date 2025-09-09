import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: ['All', 'Running', 'Casual', 'Sports', 'Formal'],
  selectedCategory: 'All',
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setProducts, setSelectedCategory, setSearchQuery } = productsSlice.actions;
export default productsSlice.reducer;