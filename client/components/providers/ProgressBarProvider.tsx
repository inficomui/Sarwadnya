'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <ProgressBar
                height="3px"
                color="#C5A059"
                options={{ showSpinner: false }}
                shallowRouting
            />
        </>
    );
}
