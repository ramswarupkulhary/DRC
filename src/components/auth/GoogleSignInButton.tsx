"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

/** Shows a "Continue with Google" button only when the Google provider is configured. */
export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        getProviders()
            .then((p) => setAvailable(!!p?.google))
            .catch(() => { });
    }, []);

    if (!available) return null;

    return (
        <div className="space-y-4">
            <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-border" />
            </div>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: callbackUrl || "/profile" })}
                className="w-full flex items-center justify-center gap-2.5 border border-border rounded-sm py-2.5 text-sm font-medium text-foreground hover:border-orange/50 hover:bg-surface-light transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
                </svg>
                Continue with Google
            </button>
        </div>
    );
}
