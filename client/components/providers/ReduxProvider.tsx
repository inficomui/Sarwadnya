"use client";

import { Provider } from "react-redux";
import reduxStore from "@/redux/store";

import AuthInitializer from "@/components/auth/AuthInitializer";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={reduxStore}>
            <AuthInitializer />
            {children}
        </Provider>
    );
}
