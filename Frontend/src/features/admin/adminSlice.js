import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Add any necessary state here if local state is needed beyond React Query
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Add reducers
    }
});

export const { } = adminSlice.actions;
export default adminSlice.reducer;
