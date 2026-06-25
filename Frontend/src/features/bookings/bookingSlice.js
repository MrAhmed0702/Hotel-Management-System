import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Add any necessary state here if local state is needed beyond React Query
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        // Add reducers
    }
});

export const { } = bookingSlice.actions;
export default bookingSlice.reducer;
