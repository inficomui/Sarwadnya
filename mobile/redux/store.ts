
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authApi } from "./apies/authApi";
import { dashboardApi } from "./apies/dashboardApi";
import { treeApi } from "./apies/treeApi";
import { transferApi } from "./apies/transferApi";
import { paymentApi } from "./apies/paymentApi";
import { payoutApi } from "./apies/payoutApi";
import { kycApi } from "./apies/kycApi";
import { referralApi } from "./apies/referralApi";
import { withdrawalApi } from "./apies/withdrawalApi";
import { walletApi } from "./apies/walletApi";
import authReducer, { logout } from "./slices/authSlice";
import { investmentApi } from "./apies/investmentApi";
import { notificationApi } from "./apies/notificationApi";
import uiReducer from "./slices/uiSlice";


const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [treeApi.reducerPath]: treeApi.reducer,
  [transferApi.reducerPath]: transferApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [payoutApi.reducerPath]: payoutApi.reducer,
  [kycApi.reducerPath]: kycApi.reducer,
  [investmentApi.reducerPath]: investmentApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
  [withdrawalApi.reducerPath]: withdrawalApi.reducer,
  [walletApi.reducerPath]: walletApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

const reduxStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      investmentApi.middleware,
      dashboardApi.middleware,
      treeApi.middleware,
      transferApi.middleware,
      paymentApi.middleware,
      payoutApi.middleware,
      kycApi.middleware,
      referralApi.middleware,
      withdrawalApi.middleware,
      walletApi.middleware,
      notificationApi.middleware,
    ),
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;

export default reduxStore;