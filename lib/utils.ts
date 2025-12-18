import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Basic regex for common API key patterns (OpenAI, GitHub, Stripeish, generics)
// This is not exhaustive but catches obvious slips.
export function redactSecrets(text: string): string {
    if (!text) return text;

    const rules = [
        // OpenAI sk-... (loose match)
        /sk-[a-zA-Z0-9]{20,}/g,
        // GitHub ghp_...
        /ghp_[a-zA-Z0-9]{20,}/g,
        // Generic "Bearer <long_string>"
        /Bearer\s+[a-zA-Z0-9\-\._~\+\/]{20,}/g,
        // Private keys in PEM format
        /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
    ];

    let redacted = text;
    rules.forEach((rule) => {
        redacted = redacted.replace(rule, '<REDACTED_SECRET>');
    });
    return redacted;
}
