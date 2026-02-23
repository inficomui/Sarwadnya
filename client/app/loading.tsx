import React from 'react';

export default function GlobalLoading() {
    return (
        // z-[9999] ensures it strictly sits over all other layouts/navbars
        // animate-in fade-in handles smooth entry transition natively
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-500">

            <div className="relative flex items-center justify-center">
                {/* Outer pulsing glow ring */}
                <div className="absolute w-24 h-24 border-4 border-primary/10 rounded-full animate-ping" />

                {/* Core spinner ring - Primary brand color on top border */}
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary border-l-primary rounded-full animate-spin shadow-[0_0_20px_rgba(0,0,0,0.1)] shadow-primary/40" />

                {/* Center breathing dot */}
                <div className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-primary animate-pulse" />
            </div>

            {/* Typography */}
            <p className="mt-8 text-sm font-semibold tracking-widest text-primary/80 uppercase animate-pulse">
                Loading...
            </p>
        </div>
    );
}
