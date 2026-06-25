import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Add any necessary state here if local state is needed beyond React Query
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        // Add reducers
    }
});

export const { } = paymentSlice.actions;
export default paymentSlice.reducer;
