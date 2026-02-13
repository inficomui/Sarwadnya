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
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; tokenType?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.tokenType = action.payload.tokenType || 'Bearer';
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<{ user: User; access_token: string; token_type: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.tokenType = action.payload.token_type;
      state.isAuthenticated = true;
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

export const { logout, setUser, setCredentials } = authSlice.actions;
export default authSlice.reducer;