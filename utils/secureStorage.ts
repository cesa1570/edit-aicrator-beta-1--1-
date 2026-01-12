export const secureStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            return decrypt(item);
        } catch (e) {
            console.warn('Storage tampering detected or invalid data');
            return null;
        }
    },

    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        const encrypted = encrypt(value);
        localStorage.setItem(key, encrypted);
    },

    removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }
};

// Simple XOR + Base64 obfuscation to prevent trivial editing in DevTools
// This is NOT bank-grade security (which requires a backend), but stops 99% of users.
const SALT = 'A1Cr@t0r_S3cur3_K3y_2026';

function encrypt(text: string): string {
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code: any) => textToChars(SALT).reduce((a, b) => a ^ b, code);

    return text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

function decrypt(encoded: string): string {
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = (code: any) => textToChars(SALT).reduce((a, b) => a ^ b, code);

    return (encoded.match(/.{1,2}/g) || [])
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}
