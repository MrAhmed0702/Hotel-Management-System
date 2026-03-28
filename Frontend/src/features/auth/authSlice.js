import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        registration: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = false;
            state.isLoading = false;
        },

        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;

            localStorage.setItem("token", action.payload.token);
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;

            localStorage.removeItem("token");
        }
    }
})

export const { registration, loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;