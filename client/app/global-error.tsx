'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Global Error caught:", error)
    }, [error])

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <div className="bg-destructive/10 p-4 rounded-lg mb-6 border border-destructive/20 max-w-lg overflow-auto">
                        <p className="text-destructive font-mono text-sm">{error.message}</p>
                        {error.digest && <p className="text-xs text-muted-foreground mt-2">Digest: {error.digest}</p>}
                    </div>
                    <button
                        onClick={() => reset()}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
