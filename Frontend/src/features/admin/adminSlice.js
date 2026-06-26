import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    hotels: [],
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setHotels: (state, action) => {
            state.hotels = action.payload;
        },
        updateHotelStatus: (state, action) => {
            const { id, status } = action.payload;
            const hotelIndex = state.hotels.findIndex(h => h._id === id);
            if (hotelIndex !== -1) {
                state.hotels[hotelIndex].status = status;
            }
        }
    }
});

export const { setHotels, updateHotelStatus } = adminSlice.actions;
export default adminSlice.reducer;
