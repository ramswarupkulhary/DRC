"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

/** Shows social sign-in buttons for whichever OAuth providers are configured. */
export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
    const [providers, setProviders] = useState<{ google: boolean; apple: boolean }>({ google: false, apple: false });

    useEffect(() => {
        getProviders()
            .then((p) => setProviders({ google: !!p?.google, apple: !!p?.apple }))
            .catch(() => { });
    }, []);

    if (!providers.google && !providers.apple) return null;

    const cb = callbackUrl || "/profile";

    return (
        <div className="space-y-3">
            <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-border" />
            </div>

            {providers.google && (
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: cb })}
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
            )}

            {providers.apple && (
                <button
                    type="button"
                    onClick={() => signIn("apple", { callbackUrl: cb })}
                    className="w-full flex items-center justify-center gap-2.5 border border-border rounded-sm py-2.5 text-sm font-medium text-foreground hover:border-orange/50 hover:bg-surface-light transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.36 12.9c.02 2.53 2.21 3.37 2.24 3.38-.02.06-.35 1.2-1.15 2.37-.69 1.02-1.41 2.03-2.55 2.05-1.11.02-1.47-.66-2.74-.66-1.28 0-1.67.64-2.72.68-1.09.04-1.92-1.1-2.62-2.11-1.43-2.06-2.53-5.83-1.05-8.38.73-1.27 2.04-2.07 3.46-2.09 1.07-.02 2.09.72 2.74.72.66 0 1.9-.89 3.2-.76.55.02 2.09.22 3.08 1.67-.08.05-1.84 1.07-1.82 3.2M14.28 5.6c.58-.7.97-1.68.86-2.66-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.88 2.57.93.07 1.87-.47 2.46-1.16" />
                    </svg>
                    Continue with Apple
                </button>
            )}
        </div>
    );
}
