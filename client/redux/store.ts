
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authApi } from "./apies/authApi";
import { adminApi } from "./apies/adminApi";
import { usersCrudApi } from "./apies/usersCrudApi";
import { dashboardApi } from "./apies/dashboardApi";
import { sliderApi } from "./apies/sliderApi";
import { treeApi } from "./apies/treeApi";
import { blogApi } from "./apies/blogApi";
import { testimonialApi } from "./apies/testimonialApi";
import { transferApi } from "./apies/transferApi";
import { paymentApi } from "./apies/paymentApi";
import { depositApi } from "./apies/depositApi";
import { payoutApi } from "./apies/payoutApi";
import { kycApi } from "./apies/kycApi";
import { referralApi } from "./apies/referralApi";
import { withdrawalApi } from "./apies/withdrawalApi";
import { walletApi } from "./apies/walletApi";

import authReducer, { logout } from "./slices/authSlice";
import adminReducer, { logoutAdmin } from "./slices/adminSlice";
import { investmentApi } from "./apies/investmentApi";
import uiReducer from "./slices/uiSlice";


const appReducer = combineReducers({
  auth: authReducer,
  adminAuth: adminReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [usersCrudApi.reducerPath]: usersCrudApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [sliderApi.reducerPath]: sliderApi.reducer,
  [treeApi.reducerPath]: treeApi.reducer,
  [blogApi.reducerPath]: blogApi.reducer,
  [testimonialApi.reducerPath]: testimonialApi.reducer,
  [transferApi.reducerPath]: transferApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [depositApi.reducerPath]: depositApi.reducer,
  [payoutApi.reducerPath]: payoutApi.reducer,
  [kycApi.reducerPath]: kycApi.reducer,
  [investmentApi.reducerPath]: investmentApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
  [withdrawalApi.reducerPath]: withdrawalApi.reducer,
  [walletApi.reducerPath]: walletApi.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type || action.type === logoutAdmin.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

const reduxStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      adminApi.middleware,
      usersCrudApi.middleware,
      investmentApi.middleware,
      dashboardApi.middleware,
      sliderApi.middleware,
      treeApi.middleware,
      blogApi.middleware,
      testimonialApi.middleware,
      transferApi.middleware,
      paymentApi.middleware,
      depositApi.middleware,
      payoutApi.middleware,
      kycApi.middleware,
      referralApi.middleware,
      withdrawalApi.middleware,
      walletApi.middleware,
    ),
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;

export default reduxStore;