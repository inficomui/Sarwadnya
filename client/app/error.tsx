'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("App Error caught:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="bg-red-50 text-red-900 p-6 rounded-xl border border-red-200 max-w-md shadow-sm">
                <div className="flex justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-lg font-bold mb-2">Something went wrong!</h2>
                <p className="text-sm mb-6 opacity-90">{error.message}</p>
                <button
                    onClick={() => reset()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
