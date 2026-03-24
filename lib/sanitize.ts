const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const TAG_RE = /<\/?[^>]+>/g;

export function sanitizeInput(value: string, maxLength = 500): string {
  if (!value) {
    return '';
  }

  const cleaned = value
    .replace(SCRIPT_TAG_RE, '')
    .replace(TAG_RE, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.slice(0, maxLength);
}

export function escapeHtml(value: string): string {
  if (!value) return '';
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return map[char] || char;
  });
}
