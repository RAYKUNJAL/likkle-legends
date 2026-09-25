/** JSON-LD safe to drop into a script tag. */
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}
