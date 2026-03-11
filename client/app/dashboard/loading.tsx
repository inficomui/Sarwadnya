"use client";

import React from 'react';

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing glow ring */}
                <div className="absolute w-20 h-20 border-4 border-primary/10 rounded-full animate-ping" />

                {/* Core spinner ring */}
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-primary/40" />

                {/* Center breathing dot */}
                <div className="absolute w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>

            <p className="mt-6 text-xs font-bold tracking-widest text-primary/60 uppercase animate-pulse">
                Preparing Page...
            </p>
        </div>
    );
}
