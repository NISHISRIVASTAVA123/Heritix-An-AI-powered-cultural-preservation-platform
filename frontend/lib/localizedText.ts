export interface LocalizedText {
    en?: string;
    hi?: string;
    native?: string;
    [key: string]: unknown;
}

export type LocalizedValue = string | LocalizedText | null | undefined;

export function resolveLocalizedText(value: LocalizedValue, fallback = ''): string {
    if (typeof value === 'string') {
        return value;
    }

    if (!value || typeof value !== 'object') {
        return fallback;
    }

    const preferredKeys = ['en', 'hi', 'native'];

    for (const key of preferredKeys) {
        const localized = value[key];
        if (typeof localized === 'string' && localized.trim()) {
            return localized;
        }
    }

    for (const localized of Object.values(value)) {
        if (typeof localized === 'string' && localized.trim()) {
            return localized;
        }
    }

    return fallback;
}
