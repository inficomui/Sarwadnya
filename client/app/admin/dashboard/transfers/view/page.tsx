"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InvestmentDetailsView from '@/components/dashboard/InvestmentDetailsView';

function InvestmentDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const investmentId = id ? parseInt(id) : 0;

    if (!investmentId) {
        return <div>Invalid Investment ID</div>;
    }

    return (
        <InvestmentDetailsView investmentId={investmentId} isAdmin={true} />
    );
}

export default function AdminInvestmentDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvestmentDetailsContent />
        </Suspense>
    );
}
