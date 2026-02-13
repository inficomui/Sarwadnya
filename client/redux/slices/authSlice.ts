import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../lib/types";
import { authApi } from "../apies/authApi";

interface AuthState {
  user: User | null;
  token: string | null;
  tokenType: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  tokenType: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tokenType = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        // Clear localStorage (for normal users)
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");

        // Clear sessionStorage (for impersonated users)
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenType");
        sessionStorage.removeItem("isImpersonating");
      }
    },
    // Keep manual setters for flexibility if needed, matching userSlice
    setUser: (state, action: PayloadAction<{ user: User; access_token: string; token_type: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.tokenType = action.payload.token_type;
      state.isAuthenticated = true;
      // LocalStorage is handled by caller or api transform, but safe to do here too if manual
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("tokenType", action.payload.token_type);
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addMatcher(
        authApi.endpoints.loginUser.matchFulfilled,
        (state, { payload }: any) => {
          if (payload) {
            state.user = payload.user || null;
            state.token = payload.access_token || payload.token || null;
            state.tokenType = payload.token_type || "Bearer";
            state.isAuthenticated = true;
          }
        }
      )
      .addMatcher(
        authApi.endpoints.registerUsers.matchFulfilled,
        (state, { payload }: any) => {
          if (payload) {
            state.user = payload.user || null;
            state.token = payload.access_token || null;
            state.tokenType = payload.token_type || "Bearer";
            state.isAuthenticated = true;
          }
        }
      )
      .addMatcher(
        authApi.endpoints.logoutUser.matchFulfilled,
        (state) => {
          state.user = null;
          state.token = null;
          state.tokenType = null;
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        authApi.endpoints.getUserProfile.matchFulfilled,
        (state, { payload }: any) => {
          if (payload) {
            state.user = payload; // Update user profile data
          }
        }
      ),
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;