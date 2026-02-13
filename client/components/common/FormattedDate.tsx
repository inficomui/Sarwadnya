"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
    date: string | number | Date | null | undefined;
    fallback?: string;
    options?: Intl.DateTimeFormatOptions;
}

export default function FormattedDate({ date, fallback = "N/A", options }: FormattedDateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !date) {
        return <>{fallback}</>;
    }

    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) {
        return <>{fallback}</>;
    }

    return <>{d.toLocaleDateString(undefined, options)}</>;
}
