import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Add any necessary state here if local state is needed beyond React Query
}

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        // Add reducers
    }
})

export const { } = roomSlice.actions;
export default roomSlice.reducer;