import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AdminUser } from "../../lib/types";
import { adminApi } from "../apies/adminApi";

interface AdminAuthState {
    adminUser: AdminUser | null;
    adminToken: string | null;
}

const initialState: AdminAuthState = {
    adminUser: null,
    adminToken: null,
};

const adminSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        setAdminCredentials: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => {
            state.adminUser = action.payload.user;
            state.adminToken = action.payload.token;
        },
        logoutAdmin: (state) => {
            state.adminUser = null;
            state.adminToken = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("adminUser");
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminTokenType");
            }
        },
    },
    extraReducers: (builder) =>
        builder
            .addMatcher(
                adminApi.endpoints.adminLogin.matchFulfilled,
                (state, { payload }: any) => {
                    if (payload) {
                        state.adminUser = payload.user || null;
                        state.adminToken = payload.access_token || null;
                    }
                }
            )
            .addMatcher(
                adminApi.endpoints.adminLogout.matchFulfilled,
                (state) => {
                    state.adminUser = null;
                    state.adminToken = null;
                }
            ),
});

export const { logoutAdmin, setAdminCredentials } = adminSlice.actions;
export default adminSlice.reducer;
